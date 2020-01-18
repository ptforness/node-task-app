const maintenance = async (req, res, next) => {
    res.status(503).send('Site down for regular maintenance.');
};

module.exports = maintenance;