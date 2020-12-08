const db = require('../database')();
//const mail = require('../mail')();
const COLLECTION = 'projects';

module.exports = () => {
    const get = async (slug = null) => {
        console.log('   inside model projects');
        if (!slug) {
            try {
                const projects = await db.get(COLLECTION);
                return { projectsList: projects };
            } catch (ex) {
                console.log("=== Exception projects::get");
                return { error: ex };
            }
        } else {
            //set slug in uppercase;
            slug = slug.toUpperCase();
            try {
                const projects = await db.get(COLLECTION, { slug });
                //check if the project exists;           
                if (projects.length != 0) {
                    return { projects };
                } else {
                    return null;
                }
            } catch (ex) {
                console.log("=== Exception projects::get{slug}");
                return { error: ex };
            }
        }
    }

    const add = async (slug, name, description) => {
        //set slug in uppercase;
        slug = slug.toUpperCase();
        let valid;
        try {
            //check if slug is unique;
            valid = await db.find(COLLECTION, { slug });
        } catch (ex) {
            console.log("=== Exception user::find{email}");
            return { error: ex };
        }
        if (!valid) {
            try {
                const results = await db.add(COLLECTION, {
                    slug: slug,
                    name: name,
                    description: description
                });
                return results.result;
            } catch (ex) {
                console.log("=== Exception projects::add");
                return { error: ex };
            }
        } else {
            return null;
        }
    }

    const aggregateWithIssues = async (slug) => {
        mail.dateUpdate();
        slug = slug.toUpperCase();
        const LOOKUP_ISSUES_PIPELINE = [
            //filter the project;
            {
                $match: {
                    'slug': slug,
                }
            },
            {
                $lookup: {
                    from: 'issues',
                    localField: '_id',
                    foreignField: 'project_id',
                    as: 'issues',
                },
            },
        ];
        try {
            const projects = await db.aggregate(COLLECTION, LOOKUP_ISSUES_PIPELINE);
            if (projects.length != 0) {
                return ({ projects });
            } else {
                return null;
            }
        } catch (ex) {
            console.log("=== Exception projects::aggregate");
            return { error: ex };
        }
    }

    return {
        get,
        add,
        aggregateWithIssues,
    }
}