const bookings = require('../model/bookingModel')();


module.exports = () => {

    const getController = async (req, res) => {
        const { projectsList, error } = await bookings.get();
        if (error) {
            return res.status(500).json({ error })
        } else {
            res.json({ projects: projectsList });
        }
    };

    const getBySlug = async (req, res) => {
        try {
            const projectsList = await bookings.get(req.params.slug);
            //check if project exists
            if (projectsList == null) {
                res.status(404).json({
                    error: 404,
                    message: 'Project not found',
                });
            } else {
                res.json(projectsList);
            }
        } catch (ex) {
            console.log("=== Exception projects::getBySlug.");
            return res.status(500).json({ error: ex })
        }
    };

    //aggregating projects and their issues;
    const projectIssues = async (req, res) => {
        try {
            const projectsList = await bookings.aggregateWithIssues(req.params.slug);
            //check if project exists
            if (projectsList == null) {
                res.status(404).json({
                    error: 404,
                    message: 'Project not found',
                });
            } else {
                res.json(projectsList);
            }
        } catch (ex) {
            console.log("=== Exception projects::projectIssues.");
            return res.status(500).json({ error: ex })
        }
    };

    const postController = async (req, res) => {
        const slug = req.body.slug;
        if (!slug) {
            res.send(`Slug is missing.`);
        }
        const name = req.body.name;
        if (!name) {
            res.send(`Name is missing.`);
        }
        const description = req.body.description;
        if (!description) {
            res.send(`Description is missing.`);
        }
        //method starts only after all the items are passed;
        if (slug && name && description) {
            console.log('  inside post projects');
            try {
                const results = await bookings.add(slug, name, description);
                //check if SLUG is unique;
                if (results != null) {
                    res.end(`POST: ${slug}, ${name}, ${description}`);
                } else {
                    res.end(`Error: ${slug} already exists.`);
                }
            } catch (ex) {
                console.log("=== Exception projects::add");
                return res.status(500).json({ error: ex })
            }
        }
    };

    return {
        getController,
        getBySlug,
        projectIssues,
        postController
    }
}