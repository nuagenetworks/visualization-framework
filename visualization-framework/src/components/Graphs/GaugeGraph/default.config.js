import { theme } from "../../../theme";

export const properties = {
    gaugePtrWidth				      : 10,
    gaugePtrTailLength        : 5,
    gaugePtrHeadLengthPercent	: 0.90,
    gaugePtrTransition        : 2000,
    gaugePtrColor             : '#937171',

    gaugeCtrColor             : '#000000',
    gaugeCtrFontSize          : 20,
    gaugeCtrFormat            : '.0f',
    gaugeCtrSuffix            : '%',

    gaugeRingInset            : 10,
    gaugeRingWidth            : 30,
    gaugeLabelInset		        : 5,
    gaugeTicks                : 10,

    minColumn                 : 'minColumn',
    maxColumn                 : 'maxValue',
    currentColumn             : 'currentValue',
    minValue                  : '0',
    maxValue                  : '100',

    colors                    : ['#8fc496', '#fc5f5f'],
    labelFormat               : '.0s',

    stroke: {
        color: theme.palette.whiteColor,
        width: "3px"
    }
}
