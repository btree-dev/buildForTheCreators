import { useDisclosure } from "@chakra-ui/react"
import useGuild from "components/[guild]/hooks/useGuild"
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react"
import useSWRImmutable from "swr/immutable"
import {
  GuildCheckoutContextType,
  GuildCheckoutProvider,
  useGuildCheckoutContext,
} from "./components/GuildCheckoutContext"

export enum GuildAction {
  JOINED_GUILD,
  IS_OWNER,
  IS_ADMIN,
}

const MIN_IMAGE_WH = 512

type ImageWH = { width: number; height: number }

const getImageWidthAndHeight = async ([_, imageUrl]): Promise<ImageWH> =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const { width, height } = img
      resolve({
        width,
        height,
      })
    }
    img.src = imageUrl
  })

const MintGuildPinContext = createContext<
  {
    pinType: GuildAction
    pinImage: string
    isImageValidating: boolean
    isInvalidImage?: boolean
    isTooSmallImage?: boolean
    error: any
    isActivateModalOpen: boolean
    onActivateModalOpen: () => void
    onActivateModalClose: () => void
    mintedTokenId?: number
    setMintedTokenId: Dispatch<SetStateAction<number>>
  } & GuildCheckoutContextType
>(undefined)

const MintGuildPinProviderComponent = ({
  children,
}: PropsWithChildren<unknown>): JSX.Element => {
  const guildCheckoutContext = useGuildCheckoutContext()

  const { id, imageUrl, featureFlags } = useGuild()
  const isInvalidImage = !imageUrl || imageUrl?.startsWith("/guildLogos")

  // TODO: allow the guild owners and admins to mint the other 2 pin types too
  const pinType = GuildAction.JOINED_GUILD

  const { data, isValidating } = useSWRImmutable(
    !isInvalidImage ? ["imageWidthAndHeight", imageUrl] : null,
    getImageWidthAndHeight
  )

  const isTooSmallImage =
    !isValidating &&
    data &&
    (data.width < MIN_IMAGE_WH || data.height < MIN_IMAGE_WH)

  const {
    isOpen: isActivateModalOpen,
    onOpen: onActivateModalOpen,
    onClose: onActivateModalClose,
  } = useDisclosure()

  const [isPinVisible, setIsPinVisible] = useState(false)
  useEffect(() => {
    if (isPinVisible || (!isActivateModalOpen && !guildCheckoutContext.isOpen))
      return
    setIsPinVisible(true)
  }, [isPinVisible, isActivateModalOpen, guildCheckoutContext.isOpen])

  const shouldFetchImage =
    featureFlags.includes("GUILD_CREDENTIAL") &&
    id &&
    typeof pinType === "number" &&
    isPinVisible
  const {
    data: pinImage,
    isValidating: isImageValidating,
    error,
  } = useSWRImmutable(
    shouldFetchImage ? `/v2/guilds/${id}/pin?guildAction=${pinType}` : null
  )

  const [mintedTokenId, setMintedTokenId] = useState<number>(null)

  return (
    <MintGuildPinContext.Provider
      value={{
        ...guildCheckoutContext,
        pinType,
        pinImage,
        isImageValidating,
        isInvalidImage,
        isTooSmallImage,
        error: error?.error,
        isActivateModalOpen,
        onActivateModalOpen,
        onActivateModalClose,
        mintedTokenId,
        setMintedTokenId,
      }}
    >
      {children}
    </MintGuildPinContext.Provider>
  )
}

const MintGuildPinProvider = ({
  children,
}: PropsWithChildren<unknown>): JSX.Element => (
  <GuildCheckoutProvider>
    <MintGuildPinProviderComponent>{children}</MintGuildPinProviderComponent>
  </GuildCheckoutProvider>
)

const useMintGuildPinContext = () => useContext(MintGuildPinContext)

export { MintGuildPinProvider, useMintGuildPinContext }
