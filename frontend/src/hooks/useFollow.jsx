import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow=()=>{
    const queryCLient=useQueryClient();

    const {mutate: follow,isPending}=useMutation({
        mutationFn:async(userId)=>{
           try {
             const res=await fetch(`/api/users/follow/${userId}`,{
                 method:"POST",
             });
 
             const response=await res.json();
             if(!res.ok){
                 throw new Error(response.message || "Something went wrong");
             }
             return;
           } catch (error) {
            throw new Error(error.message);
           }
        },
        onSuccess:()=>{
            Promise.all([
                queryCLient.invalidateQueries({queryKey:["suggestedUsers"]}),
                queryCLient.invalidateQueries({queryKey:["authUser"]}),
            ]);
        },
        onError: (error) => {
			toast.error(error.message);
		},
    });

    return {follow,isPending}
}
export default useFollow;