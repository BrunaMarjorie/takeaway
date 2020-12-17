module.exports = () => {

    const dateValidation = async (date, time) => {
        const newDate = new Date(date);
        if (!isNaN(newDate.getDay())) { //check if date format is valid;
            const currentDate = new Date();
            if (currentDate > newDate) {
                //return if booking day is on the past;
                return 0;
            } else if (newDate.getDay() == 2) { //check day of the week;
                //return if restaurant is closed on the booking day;
                return -1;
            } 
        } else {
            //return if date format informed is not valid;
            return null;
        }
        //check if time informed is available for booking;
        if (time != 16 && time != 18 && time != 20) {
            return 1;
        } else {
            newDate.setHours(time, 0, 0, 0);
        }

        const validDate = { 'date': newDate, 'time': time }
        return validDate;
    }

    const validPeopleNumber = async (number) => {
        let numPeople = Number();
        let numTables = Number();
        numPeople = parseInt(number); //convert number informed to Integer;
        //calculate the number of tables needed (round number upward);
        numTables = Math.ceil(numPeople / 4);
        if (!numTables) {
            //return if number informed is not a valid integer;
            console.log("=== Exception bookings::number");
            return null;
        }

        const validNUmber = { 'numPeople': numPeople, 'numTables': numTables }
        return validNUmber;
    }

    return {
        dateValidation,
        validPeopleNumber,
    }
}