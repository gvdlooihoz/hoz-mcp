export class IsTherapistFunction {
    constructor() {
        this.name = "isTherapist";
        this.description = "Return if the person with the given email address is a therapist at Home of Zen." +
            "The tool returns the following data:" +
            "- Is the given email address from a therapist (isTherapist);" +
            "- The full name of the therapist, if the given email address is from a therapist (name);" +
            "- The email of the therapist, if the given email address is from a therapist (email);" +
            "- The phone number of the therapist, if the given email address is from a therapist (phone);" +
            "- The address of the therapist, if the given email address is from a therapist (address);" +
            "- The zipcode of the therapist, if the given email address is from a therapist (zip);" +
            "- The city of the therapist, if the given email address is from a therapist (city);";
        this.inputschema = {
            type: "object",
            email: {
                type: "string",
                description: "The email address of the person you want to check if it is a therapist."
            },
            required: ["email"],
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
            throw new Error("No customer email provided");
        }
        const { email } = args;
        return await this.isTherapist(email);
    }
    async isTherapist(email) {
        const response = await fetch("https://istherapistv2-illi72bbyq-uc.a.run.app?email=" + email, {
            method: "GET",
            headers: {
                "apiKey": this.HOZ_API_KEY
            }
        });
        const json = await response.json();
        const therapistInfo = json;
        const text = "isTherapist: " + (therapistInfo.isTherapist === true) +
            ", name: " + therapistInfo.name +
            ", email: " + therapistInfo.email +
            ", phone: " + therapistInfo.phone +
            ", address: " + therapistInfo.address +
            ", zip: " + therapistInfo.zip +
            ", city: " + therapistInfo.city +
            ", member: " + therapistInfo.member;
        const content = [{
                type: "text",
                text: text
            }];
        return {
            content: content,
            isError: false
        };
    }
}
