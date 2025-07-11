import React from "react";
import './AccountDropDown.css'
import {Link} from 'react-router-dom';

export default function AccountDropDown() {
    return (
        <div className="account-dropdown">
            {/* Account Profile */}
            <div className="account-details">
                <p className="account-name">
                    Name of Account
                </p>
                <div className="account-icon">
                    <img src="" alt="" />
                </div>
                <div className="account-user-name-container">
                    <p className="account-user-name"> 
                        HI! Name of User
                    </p>
                </div>
            </div>
            {/* account buttons */}
            <div className="account-buttons">
                <button>
                    <span className="account-button-image">
                        +
                    </span>
                    Add Account
                </button>

                 <button>
                    <span className="account-button-image">
                        <img src="" alt="sign-out" />
                    </span>
                    Sign Out
                </button>
            </div>
        </div>
    )
}