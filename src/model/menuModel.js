const { ObjectID, Double } = require('mongodb');
const db = require('../database')(); //call database;
const COLLECTION = 'menu'; //name collection to database

module.exports = () => {

   const get = async (search = null) => {
      console.log('   inside model menu');
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
            const filter = {'$text': {'$search': search}};
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

   const add = async (dish, ingredients, allergens, price) => {
      console.log('  inside post menu');
      try {
         const results = await db.add(COLLECTION, {
            dish: dish,
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

   const updateData = async (objectID, data) => {
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
               return put;
            } catch (ex) {
               //return if any error occurs when connecting to database;
               console.log("=== Exception menu::update");
               return { error: ex };
            }
         } else {
            //return if menu item is no found;
            return null;
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