import API from "./endpoints";

export const assistantAPI = {
  chat: async (question, currentPage = "/", contextType = "project_assistant") => {
    try {
      const response = await API.post("/assistant-chat", {
        question,
        current_page: currentPage,
        context_type: contextType,
      });
      return response.data;
    } catch (error) {
      console.error("Assistant API Error:", error);
      return { answer: "I'm having trouble connecting to my knowledge base right now." };
    }
  },
};
