import './sidebar.css'
import Search from './search';
import { useState } from 'react';
import UserList from './userList';


function Sidebar ({socket,onlineUsers}) {
    const [searchKey,setSearchKey] = useState('')
    return (
        <div className="app-sidebar">
            {/* search user */}
            <Search 
                searchKey = {searchKey} 
                setSearchKey = {setSearchKey}
            />
            {/* user list */}
            <UserList searchKey={searchKey} socket= {socket} onlineUsers={onlineUsers}/>
        </div>
    )
}

export default Sidebar;