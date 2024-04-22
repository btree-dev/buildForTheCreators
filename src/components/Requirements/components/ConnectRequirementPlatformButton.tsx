import { ButtonProps, Icon } from "@chakra-ui/react"
import useConnectPlatform from "components/[guild]/JoinModal/hooks/useConnectPlatform"
import useMembershipUpdate from "components/[guild]/JoinModal/hooks/useMembershipUpdate"
import useUser from "components/[guild]/hooks/useUser"
import Button from "components/common/Button"
import { ConnectEmailButton } from "components/common/Layout/components/Account/components/AccountModal/components/SocialAccount/EmailAddress"
import { useRoleMembership } from "components/explorer/hooks/useMembership"
import useToast from "hooks/useToast"
import rewards from "platforms/rewards"
import REQUIREMENTS, { RequirementType } from "requirements"
import { PlatformName } from "../../../types"
import { useRequirementContext } from "./RequirementContext"

function requirementTypeToPlatformName(type: RequirementType): PlatformName {
  if (type === "ALLOWLIST_EMAIL") return "EMAIL"
  if (REQUIREMENTS[type].types[0] === "TWITTER") return "TWITTER_V1"
  return REQUIREMENTS[type].types[0] as PlatformName
}

const RequirementConnectButton = (props: ButtonProps) => {
  const { platformUsers, emails } = useUser()
  const { type, roleId, id } = useRequirementContext()
  const platform = requirementTypeToPlatformName(type)

  const { reqAccesses } = useRoleMembership(roleId)
  const { triggerMembershipUpdate } = useMembershipUpdate()

  const toast = useToast()

  const isReconnection = reqAccesses?.some(
    (req) => req.requirementId === id && req.errorType === "PLATFORM_CONNECT_INVALID"
  )

  const platformFromDb = platformUsers?.some(
    (platformAccount) => platformAccount.platformName === platform
  )

  if (
    platform === "EMAIL"
      ? !emails?.pending && emails?.emailAddress
      : !isReconnection && (!platformUsers || platformFromDb)
  )
    return null

  const onSuccess = () => {
    triggerMembershipUpdate()
    toast({
      title: `Successfully connected ${rewards[platform].name}`,
      description: `Your access is being re-checked...`,
      status: "success",
    })
  }

  const ButtonComponent =
    platform === "EMAIL" ? ConnectEmailButton : ConnectRequirementPlatformButton

  return (
    <ButtonComponent
      isReconnection={isReconnection}
      onSuccess={onSuccess}
      leftIcon={<Icon as={rewards[platform]?.icon} />}
      size="xs"
      iconSpacing="1"
      {...props}
    />
  )
}

const ConnectRequirementPlatformButton = ({
  onSuccess,
  isReconnection,
  ...props
}: ButtonProps & { onSuccess: () => void; isReconnection?: boolean }) => {
  const { type } = useRequirementContext()

  const platform =
    REQUIREMENTS[type].types[0] === "TWITTER"
      ? "TWITTER_V1"
      : (REQUIREMENTS[type].types[0] as PlatformName)

  const { onConnect, isLoading, loadingText } = useConnectPlatform(
    platform,
    onSuccess,
    isReconnection
  )

  return (
    <Button
      onClick={onConnect}
      isLoading={isLoading}
      loadingText={loadingText}
      colorScheme={rewards[platform]?.colorScheme}
      {...props}
    >
      {`${isReconnection ? "Reconnect" : "Connect"} ${
        rewards[platform]?.name === "X" ? "" : rewards[platform]?.name
      }`}
    </Button>
  )
}

export default RequirementConnectButton
