import { useMutation,useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useUpdateUserProfile=()=>{
    const queryClient=useQueryClient();

    const {mutateAsync:updateProfile,isPending:isUpdatingProfile}=useMutation({
        mutationFn:async(formData)=>{
            try {
                const res=await fetch(`/api/users/update`,{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                    },
                    body:JSON.stringify(formData),
                });
                const response=await res.json();
                const data=response.data;
                if(!res.ok){
                    throw new Error(response.message||"Something went wrong");
                }
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        onSuccess:()=>{
            toast.success("Profile updated successfully");
            Promise.all([
                queryClient.invalidateQueries({queryKey:["authUser"]}),
                queryClient.invalidateQueries({queryKey:["userProfile"]}),
            ]);
        },
        onError:(error)=>{
            toast.error(error.message);
        },
    });
    return {updateProfile,isUpdatingProfile};
}

export default useUpdateUserProfile;