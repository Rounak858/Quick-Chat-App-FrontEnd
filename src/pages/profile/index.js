import { useDispatch, useSelector } from 'react-redux';
import './style.css'
import moment from 'moment/moment';
import { useEffect, useState } from 'react';
import { uploadProfilePic } from '../../apiCalls/users';
import { showLoader, hideLoader } from '../../redux/loaderSlice';
import toast from 'react-hot-toast';
import { setUser } from '../../redux/userSlice';


function Profile() {
    const { user } = useSelector(state => state.userReducer)
    const [image, setImage] = useState('')
    const dispatch = useDispatch()
    useEffect(() => {
        if (user?.profilePic) {
            setImage(user.profilePic)
        }
    }, [user])
    function getInitials() {
        let fname = user?.firstName.toUpperCase()[0];
        let lname = user?.lastName.toUpperCase()[0];
        return fname + lname
    }
    function getFullName() {
        let fname = user?.firstName.at(0).toUpperCase() + user?.firstName.slice(1).toLowerCase();
        let lname = user?.lastName.at(0).toUpperCase() + user?.lastName.slice(1).toLowerCase();
        return fname + " " + lname;
    }
    const onFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // convet the file to base64
        const reader = new FileReader();
        // read the file
        reader.readAsDataURL(file);
        // set the image
        reader.onload = async () => {
            setImage(reader.result)
        }
        reader.onerror = () => {
            toast.error("Failed to read file");
        };
    }
    const updateProfilePic = async () => {
        if (!image) {
            toast.error('Please select a profile picture')
            return;
        }
        try {
            dispatch(showLoader());
            const response = await uploadProfilePic(image);
            dispatch(hideLoader());
            // console.log("Upload response:", response);
            if (response.success) {
                toast.success(response.message);
                dispatch(setUser(response.data));
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast(error.message)
            dispatch(hideLoader());
        }
    }
    return (
        <div className='profile-wrapper'>
            <div className="profile-page-container">
                <div className="profile-pic-container">
                    {image && <img src={image}
                        alt="Profile-pic"
                        className="user-profile-pic-upload"
                    />}
                    {!image && <div className="user-default-profile-avatar"> {getInitials()}</div>}
                </div>
                <div className="profile-info-container">
                    <div className='user-profile-info'>
                        <div className="user-profile-name">
                            {getFullName()}
                        </div>
                        <div>
                            <b>Email: </b> {user?.email}
                        </div>
                        <div>
                            <b>Account Created: </b> {moment(user?.createdAt).format('MMM D, YYYY')}
                        </div>
                    </div>
                    <div className="select-profile-pic-container">
                        <label htmlFor="profile-pic-upload" className="custom-file-upload">
                            Upload Profile Picture
                        </label>
                        <input
                            id="profile-pic-upload"
                            type="file"
                            accept='image/*'
                            onChange={onFileSelect}
                            style={{ display: 'none' }} />
                        <button
                            className='upload-profile-pic-button'
                            onClick={updateProfilePic}>
                            Upload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile;