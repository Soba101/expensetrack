import React from 'react';
import { View as RNView, TouchableOpacity } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';

// Interface for line chart data point
export interface LineChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

// Interface for line chart props
interface LineChartProps {
  data: LineChartDataPoint[];
  width?: number;
  height?: number;
  showDots?: boolean;
  showGrid?: boolean;
  lineColor?: string;
  onPointPress?: (point: LineChartDataPoint, index: number) => void;
}

// LineChart component for spending trends visualization
// Features: Smooth curves, interactive points, grid lines, responsive design
const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 350,
  height = 200,
  showDots = true,
  showGrid = true,
  lineColor = '#3B82F6',
  onPointPress
}) => {
  const theme = useTheme();
  const primaryText = theme.color.val;
  const secondaryText = theme.color11?.val || '#64748B';
  const gridColor = theme.borderColor.val;
  
  // Chart dimensions with padding
  const padding = 40;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  
  // Calculate min and max values
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1; // Avoid division by zero
  
  // Calculate positions for data points
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
    return { x, y, ...point };
  });
  
  // Create smooth curve path using quadratic bezier curves
  const createSmoothPath = () => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const previous = points[i - 1];
      
      if (i === 1) {
        // First curve
        const controlX = previous.x + (current.x - previous.x) / 2;
        path += ` Q ${controlX} ${previous.y} ${current.x} ${current.y}`;
      } else {
        // Subsequent curves
        const controlX = previous.x + (current.x - previous.x) / 2;
        path += ` Q ${controlX} ${previous.y} ${current.x} ${current.y}`;
      }
    }
    
    return path;
  };
  
  // Generate grid lines
  const generateGridLines = () => {
    const lines = [];
    const gridCount = 4;
    
    // Horizontal grid lines
    for (let i = 0; i <= gridCount; i++) {
      const y = padding + (i / gridCount) * chartHeight;
      lines.push(
        <Line
          key={`h-${i}`}
          x1={padding}
          y1={y}
          x2={padding + chartWidth}
          y2={y}
          stroke={gridColor}
          strokeWidth={1}
          opacity={0.3}
        />
      );
    }
    
    // Vertical grid lines
    const verticalCount = Math.min(data.length - 1, 6);
    for (let i = 0; i <= verticalCount; i++) {
      const x = padding + (i / verticalCount) * chartWidth;
      lines.push(
        <Line
          key={`v-${i}`}
          x1={x}
          y1={padding}
          x2={x}
          y2={padding + chartHeight}
          stroke={gridColor}
          strokeWidth={1}
          opacity={0.3}
        />
      );
    }
    
    return lines;
  };
  
  // Format value for display
  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <View>
      {/* Chart Container */}
      <RNView style={{ alignItems: 'center' }}>
        <Svg width={width} height={height}>
          {/* Grid lines */}
          {showGrid && generateGridLines()}
          
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const value = minValue + (valueRange * ratio);
            const y = padding + chartHeight - (ratio * chartHeight);
            return (
              <SvgText
                key={`y-label-${index}`}
                x={padding - 10}
                y={y + 4}
                fontSize="10"
                fill={secondaryText}
                textAnchor="end"
              >
                {formatValue(value)}
              </SvgText>
            );
          })}
          
          {/* X-axis labels */}
          {points.map((point, index) => {
            // Show labels for first, last, and middle points to avoid crowding
            const shouldShowLabel = index === 0 || 
                                  index === points.length - 1 || 
                                  (points.length > 4 && index === Math.floor(points.length / 2));
            
            if (!shouldShowLabel) return null;
            
            return (
              <SvgText
                key={`x-label-${index}`}
                x={point.x}
                y={height - 10}
                fontSize="10"
                fill={secondaryText}
                textAnchor="middle"
              >
                {formatDate(point.date)}
              </SvgText>
            );
          })}
          
          {/* Line path */}
          <Path
            d={createSmoothPath()}
            stroke={lineColor}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {showDots && points.map((point, index) => (
            <TouchableOpacity
              key={`point-${index}`}
              onPress={() => onPointPress?.(point, index)}
            >
              <Circle
                cx={point.x}
                cy={point.y}
                r={4}
                fill="white"
                stroke={lineColor}
                strokeWidth={2}
              />
            </TouchableOpacity>
          ))}
        </Svg>
      </RNView>
      
      {/* Summary Stats */}
      <RNView style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: gridColor
      }}>
        <RNView style={{ alignItems: 'center' }}>
          <Text fontSize="$2" color={secondaryText}>
            Highest
          </Text>
          <Text fontSize="$4" fontWeight="600" color={primaryText}>
            {formatValue(maxValue)}
          </Text>
        </RNView>
        
        <RNView style={{ alignItems: 'center' }}>
          <Text fontSize="$2" color={secondaryText}>
            Average
          </Text>
          <Text fontSize="$4" fontWeight="600" color={primaryText}>
            {formatValue(values.reduce((a, b) => a + b, 0) / values.length)}
          </Text>
        </RNView>
        
        <RNView style={{ alignItems: 'center' }}>
          <Text fontSize="$2" color={secondaryText}>
            Lowest
          </Text>
          <Text fontSize="$4" fontWeight="600" color={primaryText}>
            {formatValue(minValue)}
          </Text>
        </RNView>
      </RNView>
    </View>
  );
};

export default LineChart; 