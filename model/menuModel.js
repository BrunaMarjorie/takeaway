const { ObjectID, Double } = require('mongodb');
const db = require('../src/database')(); //call database;
const COLLECTION = 'menu'; //name collection to database

module.exports = () => {

   const get = async (search = null) => {
      console.log('   inside model menu');
      console.log('search: ' + search);
      if (!search) {
         try {
            //get menu;
            const menu = await db.get(COLLECTION);
            if (menu.length === 0) {
               return null;
            } else {
               return menu;
            }
         } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception menu::get");
            return { error: ex };
         }
      } else {
         try {
            //get menu with filter;
            const filter = { '$text': { '$search': search } };
            const menu = await db.get(COLLECTION, filter);
            if (menu.length === 0) {
               return null;
            } else {
               return menu;
            }
         } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception menu::get");
            return { error: ex };
         }
      }
   }

   const add = async (number, dish, type, ingredients, allergens, price) => {
      console.log('  inside post menu');
      let validPrice = Number();
      if (!number) {
         return { error: 'Dish number is missing.' }; //return if no dish number is informed;
      }
      if (!dish) {
         return { error: 'Dish description is missing.' }; //return if no dish is informed;
      }
      if (!ingredients) {
         return { error: 'Ingredients are missing.' }; //return if no ingredients is informed;
      }
      if (!allergens) {
         return { error: 'Allergens are missing.' }; //return if no ingredients is informed;
      }
      if (!price) {
         return { error: 'Price is missing.' }; //return if no price number is informed;
      } else {
         //validate price;
         const valid = Number(price);
         if (isNaN(valid)) {
            return { error: 'Price is not a valid number.' };
         } else {
            validPrice = parseFloat(valid).toFixed(2);
            const y = validPrice;
         }
      }
      //method starts only after all the items are passed;
      if (number && dish && ingredients && allergens && validPrice) {

         try {
            const results = await db.add(COLLECTION, {
               number: number,
               dish: dish,
               type: type,
               ingredients: ingredients,
               allergens: allergens,
               price: Double(price),
            });
            return results.result;
         } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception menu::add");
            return { error: ex };
         }
      }
   };

   const deleteData = async (objectID) => {
      try {
         console.log('   inside delete model menu');
         //find if menu item exists;
         const valid = await db.get(COLLECTION, { '_id': ObjectID(objectID) });
         if (valid.length > 0) {
            //delete routine;
            try {
               const del = await db.deleteData(COLLECTION, { '_id': ObjectID(objectID) });
               return del;
            } catch (ex) {
               //return if any error occurs when connecting to database;
               console.log("=== Exception menu model::delete");
               return { error: ex };
            }
         } else {
            //return if menu item is not found;
            return null;
         }
      } catch (ex) {
         //return if any error occurs when connecting to database;
         console.log("=== Exception menu::delete/find");
         return { error: ex };
      }
   }

   const updateData = async (id, number, dish, ingredients, allergens, price) => {
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
         return { error: 'ObjectID is not valid.' };
      }
      if (!number || !dish || !ingredients || !allergens || !price) {
         //return if no valid information is passed;
         return { error: 'Inform item(number, dish, ingredients or price) to be updated.' };
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
               return { error: 'Price is not a valid number.' };
            } else {
               price = valid.toFixed(2);
               data['price'] = price;
            }
         }
      }
         try {
            console.log('   inside update model menu');
            //find menu item using objectID;
            const valid = await db.get(COLLECTION, { '_id': ObjectID(objectID) });
            
            if (valid.length > 0) {
               try {
                  //filter the menu item to be updated;
                  const filter = { '_id': ObjectID(objectID) };
                  //set info to be updated;
                  const updateDoc = { '$set': data };
                  const put = await db.updateData(COLLECTION, filter, updateDoc);
                  return { results: put };
               } catch (ex) {
                  //return if any error occurs when connecting to database;
                  console.log("=== Exception menu::update");
                  return { error: ex };
               }
            } else {
               //return if menu item is no found;
               return { error: 'Item not found.' };
            }
         } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception menu::update/find");
            return { error: ex };
         }
      }

      return {
         get,
         add,
         deleteData,
         updateData,
      }
   }