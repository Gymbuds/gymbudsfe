import { fetchFunctionWithAuth } from '@/api/auth';

export const fetchAIAdvices = async () => {
    try {
        return await fetchFunctionWithAuth("ai_advices", { method: "GET" });
      } catch (error) {
        console.error('Error fetching workout logs:', error);
        throw error;
      }
    };
  
export const createAIAdvice = async (advice_type:string,health_data:boolean) => {
  try {
      return await fetchFunctionWithAuth("ai_advices", { 
        method: "POST",
        body:JSON.stringify({advice_type,health_data})
      });
    } catch (error) {
      console.error('Error fetching workout logs:', error);
      throw error;
    }
  };