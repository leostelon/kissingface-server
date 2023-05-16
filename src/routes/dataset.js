const router = require("express").Router();
const { db } = require("../polybase");
const { auth } = require("../middlewares/auth");
const getUser = require("../middlewares/getUser");

const repositoryReference = db.collection("Dataset");

router.get("/datasets", async (req, res) => {
	try {
		const rep = await repositoryReference
			.sort("timestamp", "desc")
			.where("private", "==", false)
			.limit(20)
			.get();
		res.send({ repositories: rep.data });
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
});

router.post("/datasets/private", auth, async (req, res) => {
	try {
		const repo = await repositoryReference.record(req.body.id).get();
		if (repo.data.creator !== req.user.id)
			return res.status(401).send({ message: "Unauthorized!" });

		const response = await repositoryReference
			.record(req.body.id)
			.call("makePrivate", []);
		res.send(response.data);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
});

router.post("/datasets/public", auth, async (req, res) => {
	try {
		const repo = await repositoryReference.record(req.body.id).get();
		if (repo.data.creator !== req.user.id)
			return res.status(401).send({ message: "Unauthorized!" });

		const response = await repositoryReference
			.record(req.body.id)
			.call("makePublic", []);
		res.send(response.data);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
});

router.get("/datasets", getUser, async (req, res) => {
	try {
		const rep = await repositoryReference
			.where("id", "==", req.query.name)
			.get();
		res.send({ repositories: rep.data });
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
});

router.get("/datasets/tags", getUser, async (req, res) => {
	try {
		let rep;
		if (req.user) {
			rep = await repositoryReference.where("name", "==", req.query.name).get();
			if (rep.data.length >= 1) {
				const repoImage = rep.data[0];
				if (repoImage.data.creator !== req.user.id) {
					rep = await repositoryReference
						.where("name", "==", req.query.name)
						.where("private", "==", false)
						.get();
				}
			}
		} else {
			rep = await repositoryReference
				.where("name", "==", req.query.name)
				.where("private", "==", false)
				.get();
		}
		res.send({ repositories: rep.data });
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
});

router.get("/datasets/user/:creator", getUser, async (req, res) => {
	try {
		let rep;
		if (req.user) {
			rep = await repositoryReference
				.where("creator", "==", req.params.creator)
				.get();
			if (rep.data.length >= 1) {
				const repoImage = rep.data[0];
				if (repoImage.data.creator !== req.user.id) {
					rep = await repositoryReference
						.where("private", "==", false)
						.where("creator", "==", req.params.creator)
						.get();
				}
			}
		} else {
			rep = await repositoryReference
				.where("private", "==", false)
				.where("creator", "==", req.params.creator)
				.get();
		}
		res.send({ repositories: rep.data });
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
});

module.exports = router;
