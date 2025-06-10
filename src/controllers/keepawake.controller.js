export const keepawake = async (req, res) => {
    console.log("Ping received to keep awake");
    res.status(200).send("OK");
}
