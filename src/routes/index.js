const router = require("express").Router();
const upload = require("./upload");
const user = require("./user");

router.use(upload);
router.use(user);

module.exports = router;
