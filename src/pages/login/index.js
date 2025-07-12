import React from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../../apiCalls/auth";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../../redux/loaderSlice";
function Login() {
    const dispatch = useDispatch();
    const [user, setUser] = React.useState({
        email: '',
        password: ''
    });
    const [terms,setterms] = React.useState(false);
    async function onFormSubmit(event) {
        event.preventDefault();
        if(!terms) {
            toast.error("You must acept terms and conditions before login.");
            return;
        }
        let response = null;
        try {
            dispatch(showLoader());
            response = await loginUser(user);
            dispatch(hideLoader());
            if(response.success) {
                toast.success(response.message);
                localStorage.setItem('token',response.token);
                window.location.href = "/";
            } else{
                toast.error(response.message);
            }
        } catch (error) {
            dispatch(hideLoader());
            toast.error(error.response?.data?.message || 'signUp failed')
        }
    }
    return (
        <div className="container">
            <div className="container-back-img"></div>
            <div className="container-back-color"></div>
            <div className="card">
                <div className="card_title">
                    <h1>Login Here</h1>
                </div>
                <div className="form">
                    <form onSubmit={onFormSubmit}>
                        <input type="email" placeholder="Email" value={user.email} onChange={(e) => { setUser({ ...user, email: e.target.value }) }} />
                        <input type="password" placeholder="password" value={user.password} onChange={(e) => { setUser({ ...user, password: e.target.value }) }} />
                        <button>Login</button>
                    </form>
                </div>
                <div className="card_terms">
                    <span>Dont have an account?
                        <Link to={"/signup"}>Sign Up</Link>
                    </span>
                    <input type="checkbox" checked = {terms} onChange={(e) => {setterms(e.target.checked)}}/>
                    <span>I agree to the Terms & Conditions</span>
                </div>
            </div>
        </div>
    )
}

export default Login;