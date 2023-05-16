const router = require("express").Router();
const upload = require("./upload");
const dataset = require("./dataset");
const user = require("./user");

router.use(upload);
router.use(dataset);
router.use(user);

module.exports = router;
