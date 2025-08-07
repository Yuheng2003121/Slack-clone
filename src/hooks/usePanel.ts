import { useProfileMemberId } from "@/feature/members/store/useProfileMemberId";
import { useParentMessageId } from "@/feature/messages/store/useParentMessageId";

export const usePanel = () => {
  //parentMessageId就是目前?parentMessageId的值
  const [parentMessageId, setParentMessageId] = useParentMessageId();
  const [profileMmeberID, setProfileMemberId] = useProfileMemberId();

  const onOpenProfile = (memberId: string) => {
    setProfileMemberId(memberId); // -> ?profileMemberId=memberId
    setParentMessageId(null);
  };

  const onCloseProfile = () => {
    setProfileMemberId(null); // -> /
    setParentMessageId(null);
  };
  const onOpenMessage = (messageId: string) => {
    setParentMessageId(messageId); // -> ?parentMessageId=messageId
    setProfileMemberId(null);
  };

  const onCloseMessage = () => {
    setParentMessageId(null); // -> /
    setProfileMemberId(null);
  };

  return { parentMessageId, profileMmeberID, onOpenProfile, onCloseProfile,onOpenMessage, onCloseMessage };
};