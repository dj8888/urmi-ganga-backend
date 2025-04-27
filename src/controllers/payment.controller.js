import { Cashfree } from "cashfree-pg";
import dotenv from 'dotenv';
dotenv.config(); // This loads the environment variables from .env
import { customAlphabet } from 'nanoid';


var cashfree = new Cashfree(Cashfree.SANDBOX, process.env.ClientID, process.env.ClientSecretKey);
//Cashfree.PRODUCTION;

const generateOrderId = () => {
    // Define the alphabet
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    // Create a custom generator with a defined length
    const nanoid = customAlphabet(alphabet, 16); // Length is set to 16
    return nanoid(); // Generates a unique ID
}

//console.log("------------------------------------------------------------------------------------------------------------");
//console.log(cashfree);
//console.log(cashfree.XApiVersion);
//console.log("------------------------------------------------------------------------------------------------------------");
export const createOrder = async (req, res) => {
    try {
        const orderId = `order_${generateOrderId()}`; // Generate a unique order ID
        var request = {
            "order_amount": 1,
            "order_currency": "INR",
            "order_id": orderId,
            "customer_details": {
                "customer_id": "walterwNrcMi",
                "customer_phone": "9999999999"
            },
            "order_meta": {
                "return_url": "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}"
                //This key holds metadata related to the order. In this case, it includes return_url, which specifies the URL to redirect the user after completing the payment process.
            },
        }
        cashfree.PGCreateOrder(request).then((response) => {
            var a = response.data;
            console.log('Order Created successfully:', a)
            res.json(a);
        })
    }
    catch (error) {
        console.error('Error setting up order request:', error.response.data.message);
    }
}

export const verifyOrder = async (req, res) => {
    try {
        console.log(req.body);
        let { orderID } = req.body;
        console.log(orderID);
        //cashfree.PGFetchOrder
        //cashfree.PGOrderFetchPayments(cashfree.XApiVersion, "order_q7plHDB33k83UfW4").then(response =>
        cashfree.PGFetchOrder(orderID).then((response) => {
            res.json(response.data)
            console.log("response success")
        }).catch((error) => {
            console.log(error);
            console.log("response fail")
        });
    } catch (error) {
        console.log(error);
    }
}
