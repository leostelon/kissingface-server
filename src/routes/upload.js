const path = require("path");
const router = require("express").Router();
const { SpheronClient, ProtocolEnum } = require("@spheron/storage");
const { upload } = require("../middlewares/multer");
const { db } = require("../polybase");

const token = process.env.SPHERON_TOKEN;
const client = new SpheronClient({ token });
const repositoryReference = db.collection("Repository");

router.post(
	"/upload",
	upload.single("file"),
	async (req, res) => {
		try {
			if (!req.file) {
				return res.send({ message: "Send file" });
			}
			const file = req.file;

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

			// Upload to polybase
			repoImage = await repositoryReference.create([
				`${req.user.username}/${name}`,
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
