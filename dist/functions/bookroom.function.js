export class BookRoomFunction {
    constructor() {
        this.name = "bookedRoom";
        this.description = "Make a room reservation at Home of Zen ." +
            "The tool returns the following data:" +
            "- Success, when the cancellation was succesful" +
            "- An error, when the cancellation was not succesful" +
            "Room reservations are always in day parts. The day parts are from 09:00 - 13:00, 13:30 - 17:30 and 18:00 - 22:00, every day of the week.";
        this.inputschema = {
            type: "object",
            email: {
                type: "string",
                description: "TThe e-mail address of the customer that wants to book the room."
            },
            date: {
                type: "string",
                description: "The date you want to book the room in yyyy-MM-dd format, i.e. '2025-03-14'."
            },
            timeFrom: {
                type: "string",
                description: "The start time of the room reservation. In hh:mm format, i.e. '09:00'."
            },
            timeTo: {
                type: "string",
                description: "The end time of the room reservation. In hh:mm format, i.e. '13:00'."
            },
            roomId: {
                type: "string",
                description: "The id of the room you want to book. The room Id can be obtained from the getAvailableRooms tool."
            },
            required: ["email, date, timeFrom, timeTo, roomId"],
        };
        this.HOZ_API_KEY = process.env.HOZ_API_KEY;
        if (!this.HOZ_API_KEY) {
            console.error("Error: HOZ_API_KEY environment variable is required");
            process.exit(1);
        }
    }
    async handleExecution(request) {
        const { name, arguments: args } = request.params;
        if (!args) {
            throw new Error("No arguments provided");
        }
        const { email, date, timeFrom, timeTo, roomId } = args;
        const result = await this.bookRoom(email, date, timeFrom, timeTo, roomId);
        return result;
    }
    async bookRoom(email, date, timeFrom, timeTo, roomId) {
        const body = {
            email: email,
            date: date,
            timeFrom: timeFrom,
            timeTo: timeTo,
            roomId: roomId
        };
        const response = await fetch("https://bookroomv2-illi72bbyq-uc.a.run.app", {
            method: "POST",
            headers: {
                "apiKey": this.HOZ_API_KEY
            },
            body: JSON.stringify(body)
        });
        const json = await response.json();
        if (json.result === "Success") {
            return {
                content: [{
                        type: "text",
                        text: "Success"
                    }]
            };
        }
        else {
            return {
                content: [{
                        type: "text",
                        text: "Error: Booking of the room was not successful."
                    }]
            };
        }
    }
}
