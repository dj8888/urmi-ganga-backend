import { Op } from 'sequelize'; // Import Op for Sequelize operators
import { sequelize } from '../config/db.js'; // Ensure this path correctly imports your sequelize instance

// Function for the scheduled cleanup
const cleanupPendingBookings = async () => {
    console.log('[Cleanup Job] Starting cleanup of pending bookings...');
    const cleanupThresholdMinutes = 15; // Define how old a pending booking must be to be cancelled
    const cutoffTime = new Date(Date.now() - cleanupThresholdMinutes * 60 * 1000); // Calculate the cutoff time

    const t = await sequelize.transaction(); // Use a transaction for atomicity
    let cancelledCount = 0;

    try {
        // Find bookings that are 'pending_payment' and older than the cutoff time
        const oldPendingBookings = await sequelize.models.Booking.findAll({
            where: {
                paymentStatus: {
                    [Op.in]: ['pending', 'in_progress']
                },
                createdAt: {
                    [Op.lt]: cutoffTime // 'createdAt' is less than (older than) cutoffTime
                }
            },
            include: [{
                model: sequelize.models.Plot,
                attributes: ['plot_id', 'status'] // Only fetch necessary plot attributes
            }],
            transaction: t,
            lock: { level: t.LOCK.UPDATE, of: sequelize.models.Booking } // Lock these rows during the transaction
        });

        if (oldPendingBookings.length === 0) {
            console.log('[Cleanup Job] No old pending bookings found to clean up.');
            await t.commit();
            return;
        }

        console.log(`[Cleanup Job] Found ${oldPendingBookings.length} old pending bookings to process.`);

        for (const booking of oldPendingBookings) {
            console.log(`[Cleanup Job] Processing Booking ID: ${booking.booking_id}, Plot ID: ${booking.plot_id}`);

            // Important: Only proceed if the booking is still truly pending (not already successful via webhook)
            // This is a safety check in case a webhook came in just before this job ran.
            if (booking.paymentStatus === 'pending' || booking.paymentStatus === 'in_progress') {
                // Update booking status to 'lapsed'
                await booking.update({
                    paymentStatus: 'expired',
                    bookingOutcome: 'lapsed'
                }, { transaction: t });

                // Free up the associated plot if it's still marked as pending/locked
                const plot = booking.Plot; // Access the eagerly loaded plot
                if (plot && (plot.status === 'pending_payment' || plot.status === 'on_hold')) {
                    await plot.update({ status: 'available' }, { transaction: t });
                    console.log(`[Cleanup Job] Plot ${plot.plot_id} status updated to 'available'.`);
                } else {
                    console.log(`[Cleanup Job] Plot ${booking.plot_id} status (${plot?.status || 'N/A'}) not changed (already available, sold, etc.).`);
                }
                cancelledCount++;
            } else {
                console.log(`[Cleanup Job] Booking ${booking.booking_id} status is no longer 'pending' or 'in_progress' (${booking.paymentStatus}). Skipping.`);
            }
        }

        await t.commit();
        console.log(`[Cleanup Job] Successfully cleaned up ${cancelledCount} lapsed bookings.`);

    } catch (error) {
        await t.rollback();
        console.error('[Cleanup Job] Error during pending bookings cleanup:', error);
    }
};

export { cleanupPendingBookings };
