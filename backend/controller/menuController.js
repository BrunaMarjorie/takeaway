const { ObjectID } = require('mongodb');
const menu = require('../model/menuModel')();
const validations = require('../validations')();

module.exports = () => {

    const getController = async (req, res) => {
        //call menuModel function;
        const Menu = await menu.get();
        if (!Menu) {
            //return if no menu found;
            return res.status(404).json({
                error: 404,
                message: 'No menu found',
            });

        } else {
            //return general list of menus;
            return res.json({ Menu });
        }
    };

    const postController = async (req, res) => {
        const user = await validations.userValidation(req.user);
        if (user['status'] !== 'admin') {
            return res.status(401).json('Action not authorized.');
        }
        //collect information;
        const { number, dish, ingredients, allergens, price } = req.body;
        let validPrice = Number();
        if (!number) {
            return res.send(`Error: dish number is missing.`); //return if no dish number is informed;
        }
        if (!dish) {
            return res.send(`Error: dish is missing.`); //return if no dish is informed;
        }
        if (!ingredients) {
            return res.send(`Error: ingredients are missing.`); //return if no ingredients is informed;
        }
        if (!allergens) {
            return res.send(`Error: allergens are missing.`); //return if no ingredients is informed;
        }
        if (!price) {
            return res.send(`Error: price is missing.`); //return if no price number is informed;
        } else {
            //validate price;
            const valid = Number(price);
            if (isNaN(valid)) {
                return res.send('Error: price is not a valid number');
            } else {
                validPrice = parseFloat(valid).toFixed(2);
                const y = validPrice;
            }
        }
        //method starts only after all the items are passed;
        if (number && dish && ingredients && allergens && validPrice) {
            try {
                //call menuModel function;
                const results = await menu.add(number, dish, ingredients, allergens, validPrice);
                //check result;
                if (results != null) {
                    return res.end(`Menu item inserted successfull: ${dish}: ${ingredients}, allergens: ${allergens} - € ${validPrice}`);
                }
            } catch (ex) {
                //return if any error occurs;
                console.log("=== Exception menu::add");
                return res.status(500).json({ error: ex });
            }
        }
    };

    const deleteController = async (req, res) => {
        const id = req.params.objectID;
        let objectID;
        try {
            //check if id collected is a valid ObjectID;
            if (new ObjectID(id).toHexString() === id) {
                objectID = id;
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception menu::delete/objectID");
            return res.send(`Error: ObjectID is not valid.`);
        }
        try {
            const results = await menu.deleteData(objectID);
            //check result;
            if (results != null && results != -1) {
                //return if success;
                return res.end(`Menu item deleted successfully`);
            } else {
                //return if menu item is not on the menu;
                return res.end(`Error: Menu item not found.`);
            }
        } catch (ex) {
            //return if any error occurs;s
            console.log("=== Exception menu::delete");
            return res.status(500).json({ error: ex });
        }
    };

    const updateController = async (req, res) => {
        const id = req.params.objectID;
        let { number, dish, ingredients, allergens, price } = req.body;
        let objectID;
        let data = {};
        try {
            //check if the ObjectID passed is valid;
            if (new ObjectID(id).toHexString() === id) {
                //if valid, assign to the objectID variable;
                objectID = id;
            }
        } catch (ex) {
            //return if objectID is not valid;
            return res.send(`Error: ObjectID is not valid.`);
        }
        if (!number || !dish || !ingredients || !allergens || !price) {
            //return if no valid information is passed;
            return res.send(`Error: inform item(number, dish, ingredients or price) to be updated.`);
        } else {
            if (number) {
                //assign values to data to be updated;
                data['number'] = number;
            }
            if (dish) { 
                //assign values to data to be updated;
                data['dish'] = dish;
            }
            if (ingredients) {
                //assign values to data to be updated;
                data['ingredients'] = ingredients;
            }
            if (allergens) {
                //assign values to data to be updated;
                data['allergens'] = allergens;
            }
            if (price) {
                //validate price;
                const valid = Number(price);
                if (isNaN(valid)) {
                    return res.send('Error: price is not a valid number');
                } else {
                    price = valid.toFixed(2);
                    data['price'] = price;
                }
            }
            try {
                const results = await menu.updateData(objectID, data);
                //check result;
                if (results != null) {
                    //return if date is available;
                    return res.end(`Item updated successfully`);
                } else {
                    //return if date is not available;
                    return res.end(`Error: menu item not found.`);
                }
            } catch (ex) {
                //return if any error occurs;
                console.log("=== Exception menu::update");
                return res.status(500).json({ error: ex });
            }
        }
    };

    const searchController = async (req, res) => {
        const search = req.body.search;
        try {
            //call menuModel function with search;
            const menuSearch = await menu.get(search);
            //check results
            if (menuSearch == null) {
                // return if menu does not have search
                return res.status(404).json({
                    error: 404,
                    message: 'Menu item not found',
                });
            } else {
                // return if search exists
                res.json(menuSearch);
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception menu::search.");
            return res.status(500).json({ error: ex })
        }
    };

    return {
        getController,
        postController,
        deleteController,
        updateController,
        searchController,
    }
}