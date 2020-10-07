import * as React from 'react';
import {Dimensions, StyleSheet, View, Animated, TextInput} from 'react-native';
import {Path, Svg, LinearGradient, Stop, Defs} from 'react-native-svg';
import * as shape from 'd3-shape';
import * as scale from 'd3-scale';
import * as svgPathProperties from 'svg-path-properties';

const height = 200;
const {width} = Dimensions.get('screen');

const {scaleTime, scaleQuantile, scaleLinear} = scale;
const d3 = {
  /* scale, */
  shape,
  /* format,
    axis, */
};

export interface GraphicSvgProps {}

const data = [
  {x: new Date(2020, 10, 1), y: 0},
  {x: new Date(2020, 10, 2), y: 100},
  {x: new Date(2020, 10, 3), y: 50},
  {x: new Date(2020, 10, 4), y: 70},
];

const scaleX = scaleTime()
  .domain([new Date(2020, 10, 1), new Date(2020, 10, 4)])
  .range([0, width]);

const scaleY = scaleLinear().domain([0, 100]).range([height, 0]);

const scaleLabel = scaleQuantile()
  .domain([0, 100])
  .range([0, 10, 20, 30, 50, 70, 100, 200]);

const line = d3.shape
  .line()
  .x((d: any): any => scaleX(d.x))
  .y((d: any): any => scaleY(d.y))
  // @ts-ignore bad doc
  .curve(d3.shape.curveBasis)(data);

const properties = svgPathProperties.svgPathProperties(line);

const lineLength = properties.getTotalLength();

function GraphicSvg() {
  const [xAnimated] = React.useState(new Animated.Value(0));
  const cursorRef = React.useRef<View>(null);
  const inputRef = React.useRef<TextInput>(null);

  const moveCursor = React.useCallback(
    (value: number) => {
      const {x, y} = properties.getPointAtLength(lineLength - value);
      if (cursorRef.current) {
        cursorRef.current.setNativeProps({
          top: y - 15,
          left: x - 15,
        });
      }

      if (inputRef.current) {
        /* console.warn(scaleY.invert(y)); */
        const label = scaleLabel(scaleY.invert(y));
        const nextX = x - 60;
        inputRef.current.setNativeProps({
          text: `${label} USD`,
          top: y - 70,
          left: nextX > 35 ? nextX : 0,
        });
      }
    },
    [cursorRef, inputRef],
  );

  React.useEffect(() => {
    xAnimated.addListener(({value}) => {
      /* console.warn('pasa', value); */
      moveCursor(value);
    });
    moveCursor(0);
  }, [xAnimated, moveCursor]);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient
            id="prefix__a"
            x1={0.5}
            x2={0.5}
            y2={1}
            gradientUnits="objectBoundingBox">
            <Stop offset={0} stopColor="#c93535" />
            <Stop offset={1} stopColor="#fff" />
          </LinearGradient>
        </Defs>
        <Path strokeWidth={5} d={line} fill="transparent" stroke="red" />
        <Path
          d={`${line} L ${width} ${height} L 0 ${height}`}
          fill="url(#prefix__a)"
        />
        <View ref={cursorRef} style={styles.cursor} />
        <View>
          <TextInput style={styles.label} ref={inputRef} />
        </View>
      </Svg>
      <Animated.ScrollView
        showsHorizontalScrollIndicator={false}
        style={StyleSheet.absoluteFill}
        contentContainerStyle={{width: lineLength * 2}}
        scrollEventThrottle={16}
        bounces={false}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {x: xAnimated},
              },
            },
          ],
          {useNativeDriver: true},
        )}
        horizontal
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    marginTop: 60,
  },
  label: {
    backgroundColor: '#ccc',
    textAlign: 'center',
    paddingVertical: 5,
    width: 120,
    zIndex: 999,
  },
  cursor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: 'red',
    borderWidth: 3,
    backgroundColor: 'white',
  },
});

export default GraphicSvg;
