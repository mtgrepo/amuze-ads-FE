import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../redux/auth/authSlice";
import { loginAdmin } from "../../../http/apis/auth/loginApi";

export const useLoginCommand = () => {

  const dispatch = useDispatch();
    const navigate = useNavigate();
    const loginMutation = useMutation({
        mutationFn: async ({email, password}: {email: string, password: string}) => {
         const res =  await loginAdmin(email, password);
         if (res) {
        dispatch(loginSuccess({
          user: res?.data?.user,
          token: res?.data?.accessToken,
          isAuthenticated: true
        }))
        navigate("/");
      }
        },
        onSuccess: () => {
            toast.success(`Login Successful`);

        }
    })
    return { 
      loginMutation: loginMutation.mutateAsync,
      isLoading: loginMutation.isPending
    
    }
}