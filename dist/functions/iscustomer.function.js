export class IsCustomerFunction {
    constructor() {
        this.name = "isCustomer";
        this.description = "Return if the person with the given email address is a customer at Home of Zen." +
            "The tool returns the following data:" +
            "- Is the given email address a customer (isCustomer);" +
            "- The first name of the customer, if the email address is a customer (firstName);" +
            "- The last name of the customer, if the email address is a customer (lastName);" +
            "- The email of the customer, if the email address is a customer (email);" +
            "- The phone number of the customer, if the email address is a customer (phone);" +
            "- Does the person has a subscription, if the email address is a customer (subscription);" +
            "- The amount of credits the customer has (credits)" +
            "A Zen is an internal digital payment method to pay for lessons, eventa and sessions. " +
            "When a customer does not have a credit in Zen, it is possible to pay the therapist/teacher cash or by payment request by bank.";
        this.inputschema = {
            type: "object",
            email: {
                type: "string",
                description: "The email address of the person you want to check if it is a customer."
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
        return await this.isCustomer(email);
    }
    async isCustomer(email) {
        const response = await fetch("https://iscustomerv2-illi72bbyq-uc.a.run.app?email=" + email, {
            method: "GET",
            headers: {
                "apiKey": this.HOZ_API_KEY
            }
        });
        const json = await response.json();
        const customerInfo = json;
        const text = "isCustomer: " + (customerInfo.isCustomer === true) +
            ", firstName: " + customerInfo.firstName +
            ", lastName: " + customerInfo.lastName +
            ", email: " + customerInfo.email +
            ", phone: " + customerInfo.phone +
            ", subscription: " + customerInfo.subscription +
            ", credits: " + customerInfo.credits;
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
