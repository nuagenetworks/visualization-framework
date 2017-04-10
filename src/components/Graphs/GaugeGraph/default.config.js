import { theme } from "../../../theme";

export const properties = {
    gauzePtrWidth				      : 10,
    gauzePtrTailLength        : 5,
    gauzePtrHeadLengthPercent	: 0.90,
    gauzePtrTransition        : 4000,

    gauzeRingInset            : 20,
    gauzeRingWidth            : 20,
    gauzeLabelInset		        : 15,
    gauzeTicks                : 10,

    minColumn                 : 'minColumn',
    maxColumn                 : 'maxValue',
    currentColumn             : 'currentValue',

    stroke: {
        color: theme.palette.whiteColor,
        width: "3px"
    }
}
