import React, { useState, useEffect } from 'react';
import { LogOut, Search, Layout, Users, FolderKanban, UserPlus, LogOut as LeaveIcon, AlertCircle, Check, X as XIcon, UserCheck, Clock } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import '../App.css';
import { Link } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [teamInvites, setTeamInvites] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [outgoingInvites, setOutgoingInvites] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      const response = await fetch('http://localhost/PFE/Back-end/LogOut.php', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        navigate('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setShowConfirm(false);
    }
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  // New state for team management
  const [teamData, setTeamData] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMatricule, setInviteMatricule] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Fetch team data when component mounts
  useEffect(() => {
    fetchTeamData();
    fetchTeamInvites();
    fetchOutgoingInvites();
  }, []);

  const fetchTeamData = async () => {
    try {
      const response = await fetch('http://localhost/PFE/Back-end/getTeamInfo.php', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTeamData(data);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    }
  };

  const fetchTeamInvites = async () => {
    try {
      const response = await fetch('http://localhost/PFE/Back-end/getTeamInvites.php', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setTeamInvites(data.invites);
        }
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  const fetchOutgoingInvites = async () => {
    try {
      const response = await fetch('http://localhost/PFE/Back-end/getTeamInfo.php?type=outgoing', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setOutgoingInvites(data.outgoingInvites || []);
        }
      }
    } catch (error) {
      console.error('Error fetching outgoing invites:', error);
    }
  };

  const handleInvite = async () => {
    try {
      const response = await fetch('http://localhost/PFE/Back-end/inviteTeamMember.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ matricule: inviteMatricule })
      });

      const data = await response.json();
      if (response.ok) {
        fetchTeamData(); // Refresh team data
        setShowInviteModal(false);
        setInviteMatricule('');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  const handleLeaveTeam = async () => {
    try {
      const response = await fetch('http://localhost/PFE/Back-end/leaveTeam.php', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        fetchTeamData(); // Refresh team data
        setShowLeaveConfirm(false);
      }
    } catch (error) {
      console.error('Error leaving team:', error);
    }
  };

  const handleInviteResponse = async (inviteId, response) => {
    try {
      const result = await fetch('http://localhost/PFE/Back-end/respondToInvite.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inviteID: inviteId, response })
      });

      if (result.ok) {
        // Refresh both team data and invites
        await fetchTeamData();
        await fetchTeamInvites();
      }
    } catch (error) {
      console.error('Error responding to invite:', error);
    }
  };

  const handleMatriculeChange = async (e) => {
    const value = e.target.value;
    setInviteMatricule(value);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (value.length >= 2) {
      // Set new timeout for search
      const timeoutId = setTimeout(async () => {
        try {
          const response = await fetch(`http://localhost/PFE/Back-end/searchStudents.php?query=${encodeURIComponent(value)}`, {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
              setSearchResults(data.students);
            }
          }
        } catch (error) {
          console.error('Error searching students:', error);
        }
      }, 300); // Debounce time of 300ms
      
      setSearchTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  };

  const selectStudent = (matricule) => {
    setInviteMatricule(matricule);
    setSearchResults([]);
  };

  const handleCancelInvite = async (inviteId) => {
    try {
      const response = await fetch('http://localhost/PFE/Back-end/cancelInvite.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inviteID: inviteId })
      });

      if (response.ok) {
        // Refresh team data to update invites
        await fetchTeamData();
      }
    } catch (error) {
      console.error('Error cancelling invite:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-6">
            {/* Search Bar */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="flex items-center w-64 px-3 py-2 bg-white border rounded hover:border-indigo-400 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-colors">
                <Search className="h-4 w-4 text-slate-400" />
                <input 
                  className="bg-transparent outline-none text-sm w-full ml-2" 
                  placeholder="Search..."
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-emerald-500 p-4 rounded-lg text-white">
                <div className="text-xs text-emerald-100 mb-1">MY TEAM</div>
                <div className="text-2xl">Team Name</div>
              </div>
              <div className="bg-blue-500 p-4 rounded-lg text-white">
                <div className="text-xs text-blue-100 mb-1">MY PROJECT</div>
                <div className="text-2xl">Project Title</div>
              </div>
              <div className="bg-violet-500 p-4 rounded-lg text-white">
                <div className="text-xs text-violet-100 mb-1">TEAM MEMBERS</div>
                <div className="text-2xl">3</div>
              </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">My Project</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Project Details</h3>
                <p className="text-gray-600">No project assigned yet.</p>
              </div>
            </div>
          </div>
        );
      case 'team':
        return (
          <div className="p-6">
            {/* Team Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Team</h2>
              <div className="space-x-3">
                {teamData?.members?.length === 1 && !teamData?.hasPendingOutgoingInvite && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <UserPlus size={18} />
                    Invite Member
                  </button>
                )}
                {teamData?.hasPendingOutgoingInvite && (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-400 text-white rounded-lg flex items-center gap-2 cursor-not-allowed"
                    title="You have a pending invite"
                  >
                    <Clock size={18} />
                    Invite Pending
                  </button>
                )}
                {teamData?.members?.length > 1 && (
                  <button
                    onClick={() => setShowLeaveConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <LeaveIcon size={18} />
                    Leave Team
                  </button>
                )}
              </div>
            </div>

            {/* Team Invites Section */}
            {teamInvites.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Incoming Team Invites</h3>
                <div className="space-y-3">
                  {teamInvites.map((invite) => (
                    <div key={invite.inviteID} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                      <div>
                        <p className="font-medium">
                          {invite.first_name} {invite.last_name} ({invite.matricule})
                        </p>
                        <p className="text-sm text-gray-600">
                          Invites you to join their team: {invite.teamName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleInviteResponse(invite.inviteID, 'accept')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                          title="Accept"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={() => handleInviteResponse(invite.inviteID, 'decline')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title="Decline"
                        >
                          <XIcon size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outgoing Invites Section */}
            {teamData?.outgoingInvites?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Outgoing Team Invites</h3>
                <div className="space-y-3">
                  {teamData.outgoingInvites.map((invite) => (
                    <div key={invite.inviteID} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                      <div>
                        <p className="font-medium">
                          {invite.first_name} {invite.last_name} ({invite.matricule})
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Waiting for response
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCancelInvite(invite.inviteID)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title="Cancel Invite"
                        >
                          <XIcon size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Info Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 bg-indigo-600 text-white">
                <h3 className="text-xl font-semibold mb-1">{teamData?.teamName || 'Loading...'}</h3>
                <p className="text-indigo-200">Team Members: {teamData?.members?.length || 0}/2</p>
              </div>

              {/* Team Members */}
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  {teamData?.members?.map((member) => (
                    <div key={member.matricule} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-indigo-600">
                          {member.first_name?.[0]}{member.last_name?.[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold">{member.first_name} {member.last_name}</h4>
                        <p className="text-gray-600">Matricule: {member.matricule}</p>
                        <p className="text-gray-600">{member.email}</p>
                      </div>
                    </div>
                  ))}
                  {!teamData?.members?.length && (
                    <div className="text-center py-6 text-gray-500">
                      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p>No team members found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <h3 className="text-lg font-medium mb-4">Invite Team Member</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search by Matricule or Name
                    </label>
                    <input
                      type="text"
                      value={inviteMatricule}
                      onChange={handleMatriculeChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter matricule or name"
                    />
                    
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="mt-2 border rounded-md divide-y">
                        {searchResults.map((student) => (
                          <div
                            key={student.matricule}
                            onClick={() => selectStudent(student.matricule)}
                            className={`p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                              !student.available ? 'opacity-50' : ''
                            }`}
                          >
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.matricule}</div>
                            </div>
                            {!student.available && (
                              <span className="text-xs text-red-500">Already in a team</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowInviteModal(false);
                        setInviteMatricule('');
                        setSearchResults([]);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleInvite}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Send Invite
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Leave Team Confirmation */}
            {showLeaveConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-lg font-medium mb-4">Leave Team?</h3>
                  <p className="text-gray-600 mb-4">Are you sure you want to leave your team? This action cannot be undone.</p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowLeaveConfirm(false)}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLeaveTeam}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Leave Team
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="text-lg text-white">STUDENT SPACE</div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-white bg-red-800 rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="h-full bg-white border-r w-48">
          <div className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                  activeTab === 'dashboard'
                    ? 'text-white bg-indigo-500'
                    : 'text-slate-600 hover:bg-indigo-50'
                }`}
              >
                <Layout size={18} />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                  activeTab === 'projects'
                    ? 'text-white bg-indigo-500'
                    : 'text-slate-600 hover:bg-indigo-50'
                }`}
              >
                <FolderKanban size={18} />
                Project
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                  activeTab === 'team'
                    ? 'text-white bg-indigo-500'
                    : 'text-slate-600 hover:bg-indigo-50'
                }`}
              >
                <Users size={18} />
                Team
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {renderContent()}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium mb-4">Are you sure you want to logout?</h3>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelLogout}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

