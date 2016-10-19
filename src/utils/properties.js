// Define all default properties for graphs

const defaults = {
    margin: {
        top: 15,
        bottom: 20,
        left: 30,
        right: 20
    },
    padding: 0.1,
    yTickGrid: true,
    yTickSizeInner: 6,
    yTickSizeOuter: 0,
    xTickGrid: false,
    xTickSizeInner: 6,
    xTickSizeOuter: 0,
    orientation: "vertical",
    dateHistogram: false,
    interval: "30s"
}

export const getDefaultProperties = (properties) => {
    return Object.assign({}, defaults, properties);
};
