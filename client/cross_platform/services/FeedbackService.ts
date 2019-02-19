import { makeAuthenticatedRequest } from "./NetworkService";

export async function submitFeedback(feedback: string) {
    return makeAuthenticatedRequest("POST", "/user/feedback", {feedback});
}
