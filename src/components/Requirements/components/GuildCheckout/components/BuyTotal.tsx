import { HStack, Skeleton, Td, Text, Tr } from "@chakra-ui/react"
import useToken from "hooks/useToken"
import useVault from "requirements/Payment/hooks/useVault"
import { NULL_ADDRESS } from "utils/guildCheckout/constants"
import { formatUnits } from "viem"
import { CHAIN_CONFIG, Chains } from "wagmiConfig/chains"
import { useRequirementContext } from "../../RequirementContext"
import usePayFee from "../hooks/usePayFee"
import FeesTable from "./FeesTable"
import { useGuildCheckoutContext } from "./GuildCheckoutContext"
import PriceFallback from "./PriceFallback"

const BuyTotal = (): JSX.Element => {
  const requirement = useRequirementContext()
  const { pickedCurrency } = useGuildCheckoutContext()

  const { token, fee, isLoading, error } = useVault(
    requirement.address,
    requirement.data.id,
    requirement.chain
  )

  const { data: tokenData } = useToken({
    address: token,
    chainId: Chains[requirement.chain],
    shouldFetch: Boolean(token !== NULL_ADDRESS && Chains[requirement.chain]),
  })

  const isNativeCurrency = pickedCurrency === NULL_ADDRESS

  const { isPreparing, estimatedGas } = usePayFee()

  const estimatedGasInFloat =
    typeof estimatedGas === "bigint"
      ? parseFloat(
          formatUnits(
            estimatedGas,
            CHAIN_CONFIG[requirement.chain].nativeCurrency.decimals
          )
        )
      : null

  const priceInSellToken = fee
    ? isNativeCurrency
      ? Number(
          formatUnits(fee, CHAIN_CONFIG[requirement.chain].nativeCurrency.decimals)
        )
      : tokenData?.decimals
      ? Number(formatUnits(fee, tokenData.decimals)) +
        (isNativeCurrency ? estimatedGasInFloat ?? 0 : 0)
      : 0
    : 0

  const isTooSmallPrice = priceInSellToken < 0.001

  return (
    <FeesTable
      buttonComponent={
        <HStack justifyContent={"space-between"} w="full">
          <Text as="span" colorScheme="gray">
            Total with fees:
          </Text>

          <PriceFallback {...{ error, pickedCurrency }}>
            <Text as="span">
              <Skeleton isLoaded={!isLoading}>
                <Text as="span" fontWeight="semibold">
                  {priceInSellToken
                    ? `${
                        isTooSmallPrice
                          ? "< 0.001"
                          : Number(priceInSellToken.toFixed(3))
                      } `
                    : "0.00 "}
                  {tokenData?.symbol}
                </Text>
                {!isNativeCurrency && (
                  <Text as="span" colorScheme="gray">
                    {` + Gas`}
                  </Text>
                )}
              </Skeleton>
            </Text>
          </PriceFallback>
        </HStack>
      }
    >
      <Tr>
        <Td>Price</Td>
        <Td isNumeric color="var(--chakra-colors-chakra-body-text)">
          {priceInSellToken
            ? `${isTooSmallPrice ? "< 0.001" : Number(priceInSellToken.toFixed(3))} `
            : "0.00 "}
          {tokenData?.symbol}
        </Td>
      </Tr>
      <Tr>
        <Td>Gas fee</Td>
        <Td isNumeric>
          <Skeleton isLoaded={!isPreparing}>
            {!estimatedGasInFloat
              ? "Couldn't estimate"
              : `${Number(estimatedGasInFloat.toFixed(8))} ${
                  CHAIN_CONFIG[requirement.chain].nativeCurrency.symbol
                }`}
          </Skeleton>
        </Td>
      </Tr>
    </FeesTable>
  )
}

export default BuyTotal
