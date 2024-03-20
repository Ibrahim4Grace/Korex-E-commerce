const paginatedResults = (model) => {
    return async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const perPage = 10; // Number of items per page

        try {
            const totalItems = await model.countDocuments();
            const totalPages = Math.ceil(totalItems / perPage);

            const results = await model
                .find()
                .sort({ date_added: -1 }) // Sort by date_added in descending order
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();

            res.paginatedResults = {
                results,
                currentPage: page,
                totalPages
            };
            next();
        } catch (error) {
            console.error('Error retrieving information:', error);
            res.status(500).send('Error retrieving information');
        }
    };
};

module.exports = paginatedResults;