const router = require("express").Router();
const upload = require("./upload");
const dataset = require("./dataset");
const token = require("./token");
const user = require("./user");

router.use(upload);
router.use(dataset);
router.use(user);
router.use(token);

module.exports = router;
