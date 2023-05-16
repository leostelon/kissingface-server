const router = require("express").Router();
const { db } = require("../polybase");
const { auth } = require("../middlewares/auth");
const accessTokenReference = db.collection("AccessToken");
const datasetReference = db.collection("Dataset");

router.post("/token/create", auth, async (req, res) => {
	try {
		const {
			datasetId,
			name,
			tokenAddress,
			minimumPurchase,
			pricePerToken,
			maxSupply,
		} = req.body;
		const accessToken = await accessTokenReference.create([
			datasetId,
			req.user.id,
			name,
			tokenAddress,
			minimumPurchase,
			pricePerToken,
			maxSupply,
		]);

		await datasetReference.record(datasetId).call("enableTokenAccess", []);

		res.send(accessToken.data);
	} catch (error) {
		console.log(error);
		res.status(500).send({ message: error.message });
	}
});

module.exports = router;
