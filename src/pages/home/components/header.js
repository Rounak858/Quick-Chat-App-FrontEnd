import './header.css'
import logo from './comments.png'
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';

function Header({socket}) {
    const user = useSelector(state => state.userReducer.user);
    const navigate = useNavigate();
    function getFullName() {
        let fname = user?.firstName.at(0).toUpperCase() + user?.firstName.slice(1).toLowerCase();
        let lname = user?.lastName.at(0).toUpperCase() + user?.lastName.slice(1).toLowerCase();
        return fname + " " + lname;
    }
    function getInitials() {
        let fname = user?.firstName.toUpperCase()[0];
        let lname = user?.lastName.toUpperCase()[0];
        return fname + lname
    }
    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        socket.emit('user-logout',user._id);
    }
    return (
        <div className="app-header">
            <div className="app-logo">
                <i className="fa fa comment" aria-hidden="true"></i>
                <img className="logo" src={logo} alt="" />
                Quick Chat
            </div>
            <div className="app-user-profile">
                {user?.profilePic &&
                    <img
                        className="logged-user-profile-pic"
                        src={user.profilePic}
                        alt="Profile pic"
                        onClick={() => navigate('/profile')} />}
                {!user?.profilePic &&
                    <div
                        className="logged-user-profile-pic"
                        onClick={() => navigate('/profile')}>{getInitials()}
                    </div>}
                <div className="logged-user-name">{getFullName()}</div>
                <button className='logout-button' onClick={logout}>
                    <i className='fa fa-power-off'></i>
                </button>
            </div>
        </div>
    )
}

export default Header;