const util = require("util");
const exec = util.promisify(require("child_process").exec);
const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const { db } = require("../polybase");

const jobReference = db.collection("Job");

router.post("/bacalhau", auth, async (req, res) => {
	try {
		const { prompt, ipfsPath } = req.body;
		if (!prompt || !ipfsPath)
			return res
				.status(500)
				.send({ message: "Please send both prompt and ipfs path." });

		// Create a job
		const command = `bacalhau docker run -i ${ipfsPath} jsacex/dreambooth:full --id-only -- bash finetune.sh /inputs /outputs ${prompt} 100`;
		const { stdout, stderr } = await exec(command);
		if (stderr) return console.log("Error", stderr);
		console.log(stdout);

		// Upload job id to polybase
		const response = await jobReference.create([
			stdout,
			req.user.id,
		]);

		res.send(response.data);
	} catch (error) {
		console.log(error.message);
	}
});

router.get("/bacalhau", auth, async (req, res) => {
	try {
		const response = await jobReference
			.where("user", "==", req.user.id)
			.sort("timestamp", "desc")
			.get();

		res.send(response.data);
	} catch (error) {
		console.log(error.message);
	}
});

module.exports = router;

// bacalhau docker run -i ipfs://QmRKnvqvpFzLjEoeeNNGHtc7H8fCn9TvNWHFnbBHkK8Mhy jsacex/dreambooth:full --id-only -- bash finetune.sh /inputs /outputs "a photo of sbf man" 3000
// bacalhau docker run \ --gpu 1 \ -i ipfs://QmRKnvqvpFzLjEoeeNNGHtc7H8fCn9TvNWHFnbBHkK8Mhy \ jsacex/dreambooth:full \ -- bash finetune.sh /inputs /outputs "a photo of sbf man" "a photo of man" 3000 "/man"  "/model"
