import React from "react"
import { Link } from "react-router-dom"
import './style.css'
import { signupUser } from "./../../apiCalls/auth";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../../redux/loaderSlice";


function SignUp() {
    const dispatch = useDispatch();
    const [user, setUser] = React.useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [terms, setTerms] = React.useState(false);
    async function onFormSubmit(event) {
        event.preventDefault();
        if(!terms) {
            alert("You must acept terms and conditions before signing up.")
            return;
        }
        let response = null;
        try {
            dispatch(showLoader());
            response = await signupUser(user);
            dispatch(hideLoader());
            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            dispatch(hideLoader());
            // alert( error.response?.data?.message || 'signUp failed')
            toast.error(response.message);
        }
        if(!terms) {
            toast.error("You must acept terms and conditions before signing up.")
            return;
        }
    }
    return (
        <div className="container ">
            <div className="container-back-img "></div>
            <div className="container-back-color"></div>
            <div className="card">
                <div className="card_title">
                    <h1>Create Account</h1>
                </div>
                <div className="form">
                    <form onSubmit={onFormSubmit}>
                        <div className="column">
                            <input type="text" placeholder="First Name" value={user.firstName} onChange={(e) => { setUser({ ...user, firstName: e.target.value }) }} />
                            <input type="text" placeholder="Last Name" value={user.lastName} onChange={(e) => { setUser({ ...user, lastName: e.target.value }) }} />
                        </div>
                        <input type="email" placeholder="Email" value={user.email} onChange={(e) => { setUser({ ...user, email: e.target.value }) }} />
                        <input type="password" placeholder="Password" value={user.password} onChange={(e) => { setUser({ ...user, password: e.target.value }) }} />
                        <button>Sign Up</button>
                    </form>
                </div>
                <div className="card_terms">
                    <span>Already have an account?
                        <Link to={"/login"}>Login Here</Link>
                    </span>
                    <input type="checkbox" checked = {terms} onChange={(e) => { setTerms(e.target.checked) }} />
                    <span className="" >I accept the terms and conditions</span>
                </div>
            </div>
        </div>
    )
}

export default SignUp;