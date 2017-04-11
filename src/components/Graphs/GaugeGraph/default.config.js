import { theme } from "../../../theme";

export const properties = {
    gaugePtrWidth				      : 10,
    gaugePtrTailLength        : 5,
    gaugePtrHeadLengthPercent	: 0.90,
    gaugePtrTransition        : 4000,
    gaugePtrColor             : '#f9b13d',

    gaugeRingInset            : 10,
    gaugeRingWidth            : 30,
    gaugeLabelInset		        : 5,
    gaugeTicks                : 10,

    minColumn                 : 'minColumn',
    maxColumn                 : 'maxValue',
    currentColumn             : 'currentValue',

    colors                    : ['#e8e2ca', '#b3d645'],
    labelFormat               : '.2s',
    
    stroke: {
        color: theme.palette.whiteColor,
        width: "3px"
    }
}
