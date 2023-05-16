const fs = require("fs");
const path = require("path");
const router = require("express").Router();
const { SpheronClient, ProtocolEnum } = require("@spheron/storage");
const { upload } = require("../middlewares/multer");
const { db } = require("../polybase");
const { auth } = require("../middlewares/auth");

const token = process.env.SPHERON_TOKEN;
const client = new SpheronClient({ token });
const dataReference = db.collection("Dataset");

router.post(
	"/upload/dataset",
	auth,
	upload.single("file"),
	async (req, res) => {
		try {
			if (!req.file) {
				return res.send({ message: "Please upload a file." });
			}
			const file = req.file;
			const dataset = req.body.dataset;
			const tag = dataset.split(":").pop();
			const name = dataset.split(":").slice(0, -1).join(":");

			// Upload to Spheron
			const filePath = path.join(__dirname, "../../uploads/" + file.filename);
			const response = await client.upload(filePath, {
				protocol: ProtocolEnum.IPFS,
				name: "testdaggle",
				onUploadInitiated: (uploadId) => {
					console.log(`Upload with id ${uploadId} started...`);
				},
				onChunkUploaded: (uploadedSize, totalSize) => {
					let currentlyUploaded;
					currentlyUploaded += uploadedSize;
					console.log(`Uploaded ${currentlyUploaded} of ${totalSize} Bytes.`);
				},
			});

			// Check for latest
			const dataSetList = await dataReference
				.where("name", "==", `${req.user.id}/${name}`)
				.where("latest", "==", true)
				.get();
			if (dataSetList.data.length > 0) {
				ds = dataSetList.data[0].data;
				await dataReference.record(ds.id).call("disableLatest", []);
			}
			// Upload to polybase
			repoImage = await dataReference.create([
				`${req.user.id}/${name}`,
				tag,
				response.protocolLink,
				req.user.id,
			]);

			// Delete File
			fs.rmSync(`${file.destination}/${file.filename}`);

			res.send(response);
		} catch (error) {
			console.log(error);
			res.status(500).send({ message: error.message });
		}
	},
	(err, req, res, next) => {
		console.log(err);
		res.status(400).send({ error: err.message });
	}
);

module.exports = router;
