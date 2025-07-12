import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getloggedUser, getAllUsers } from "../apiCalls/users";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { setAllUser, setUser, seeAllChats } from "../redux/userSlice";
import { getAllChats } from "../apiCalls/chat";
import toast from "react-hot-toast";

function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const [loading, setloading] = useState(true);
    // const user  = useSelector((state )=> state.userReducer.user);
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        const getloggedInUser = async () => {
            let response = null
            try {
                dispatch(showLoader());
                response = await getloggedUser();
                dispatch(hideLoader());
                if (response.success) {
                    dispatch(setUser(response.data));
                    setloading(false);
                } else {
                    toast.error(setUser(response.message));
                    // toast.error(response.message);
                    navigate('/login')
                }
            }
            catch (error) {
                dispatch(hideLoader());
                localStorage.removeItem("token");
                navigate("/login");
            }
        }
        const fetchAllUsers = async () => {
            let response = null
            try {
                dispatch(showLoader());
                response = await getAllUsers();
                dispatch(hideLoader());
                if (response.success) {
                    dispatch(setAllUser(response.data));
                    setloading(false);
                } else {
                    toast.error(response.message);
                    navigate('/login')
                }
            } catch (error) {
                dispatch(hideLoader());
                localStorage.removeItem("token");
                navigate("/login");
            }
        }

        const getCurrentUserChats = async () => {
            try {
                const response = await getAllChats();
                if (response.success) {
                    dispatch(seeAllChats(response.data));
                }
            } catch (error) {
                navigate('/login');
            }
        }
        fetchAllUsers();
        getloggedInUser();
        getCurrentUserChats();
    }, [navigate, dispatch]);
    if (loading) return null;
    return (
        <div >
            {children}
        </div>
    );
}


export default ProtectedRoute;



