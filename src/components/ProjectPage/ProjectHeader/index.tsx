import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import BlockWrapper from '../../wrappers/BlockWrapper';
import AddParticipantDialog from '../AddParticipantDialog';
import AddTeamDialog from '../AddTeamDialog';
import { AddParticipantButton } from './AddParticipantButton';
import { useBadgeUtils } from './BadgeUtils';
import { ParticipantAvatar } from './ParticipantAvatar';
import { ParticipantList } from './ParticipantList';
import { ProjectBanner } from './ProjectBanner';
import { StickyHeader } from './StickyHeader';
import { useProjectHeader } from './hooks/useProjectHeader';

export default function ProjectHeader() {
  const {
    project,
    error,
    collaborators,
    teams,
    participants,
    predefinedRoles,
    isAddParticipantOpen,
    isAddTeamOpen,
    selectedRole,
    setIsAddParticipantOpen,
    setIsAddTeamOpen,
    handleRemoveParticipant,
    handleRemoveCollaborator,
    handleRemoveTeam,
    handleAddParticipant,
    handleAddRole,
    handleSelectRole,
  } = useProjectHeader();

  const [isSticky, setIsSticky] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const [showParticipantsDialog, setShowParticipantsDialog] = useState(false);

  // Handle sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (bannerRef.current) {
        const bannerBottom = bannerRef.current.getBoundingClientRect().bottom;
        setIsSticky(bannerBottom <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      return window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleShowParticipants = () => {
    setShowParticipantsDialog(true);
  };

  const handleProjectStatus = () => {
    toast.info(`Current status: ${project?.projectStatus || 'Active'}`);
  };

  const { getStatusBadge, getRoleBadge } = useBadgeUtils({ predefinedRoles });

  if (error) return <div className='text-red-500'>{error}</div>;
  if (!project) return <></>;

  return (
    <BlockWrapper>
      <div className=''>
        <ProjectBanner project={project} bannerRef={bannerRef} />

        {isSticky && (
          <StickyHeader
            project={project}
            onShowParticipants={handleShowParticipants}
            onProjectStatus={handleProjectStatus}
          />
        )}

        <div id='participants-section' className='container mx-auto px-4 py-3 sm:py-4'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex flex-wrap items-center gap-4'>
              <div className='flex flex-wrap items-center gap-4'>
                {/* Participants */}
                {project.participants.map((participant) => {
                  return (
                    <ParticipantAvatar
                      key={participant._id}
                      participant={{
                        id: participant._id,
                        name: participant.name,
                        role: participant.role,
                        avatar: participant.avatar,
                        email: participant.email,
                        status: participant.status as 'active' | 'pending' | 'inactive',
                        permissions: [],
                        dateAdded: new Date().toISOString(),
                      }}
                      onRemove={handleRemoveParticipant}
                      getRoleBadge={getRoleBadge}
                    />
                  );
                })}

                {/* Collaborators */}
                {collaborators.map((collaborator) => {
                  return (
                    <ParticipantAvatar
                      key={collaborator._id}
                      collaborator={collaborator}
                      onRemove={handleRemoveCollaborator}
                      getRoleBadge={getRoleBadge}
                    />
                  );
                })}

                {/* Teams */}
                {teams.map((team) => {
                  return (
                    <ParticipantAvatar
                      key={team.id}
                      team={team}
                      onRemove={handleRemoveTeam}
                      getRoleBadge={getRoleBadge}
                    />
                  );
                })}

                <AddParticipantButton onSelectRole={handleSelectRole} />

                <AddParticipantDialog
                  isOpen={isAddParticipantOpen}
                  onOpenChange={setIsAddParticipantOpen}
                  onAddParticipant={handleAddParticipant}
                  predefinedRoles={predefinedRoles}
                  onAddRole={handleAddRole}
                  getRoleBadge={getRoleBadge}
                />

                <AddTeamDialog
                  isOpen={isAddTeamOpen}
                  onOpenChange={setIsAddTeamOpen}
                  selectedRole={selectedRole}
                  onAddParticipant={handleAddParticipant}
                />
              </div>
            </div>
          </div>
        </div>

        <ParticipantList
          participants={participants}
          collaborators={collaborators}
          isOpen={showParticipantsDialog}
          onOpenChange={setShowParticipantsDialog}
          onRemoveParticipant={handleRemoveParticipant}
          onRemoveCollaborator={handleRemoveCollaborator}
          getRoleBadge={getRoleBadge}
          getStatusBadge={getStatusBadge}
        />
      </div>
    </BlockWrapper>
  );
}
