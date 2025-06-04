import React from 'react';
import { View as RNView, TouchableOpacity } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';

// Interface for bar chart data
export interface BarChartData {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

// Interface for bar chart props
interface BarChartProps {
  data: BarChartData[];
  width?: number;
  height?: number;
  showValues?: boolean;
  showGrid?: boolean;
  orientation?: 'vertical' | 'horizontal';
  onBarPress?: (bar: BarChartData, index: number) => void;
}

// BarChart component for category and vendor comparisons
// Features: Horizontal and vertical orientations, interactive bars, clean design
const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 350,
  height = 250,
  showValues = true,
  showGrid = true,
  orientation = 'vertical',
  onBarPress
}) => {
  const theme = useTheme();
  const primaryText = theme.color.val;
  const secondaryText = theme.color11?.val || '#64748B';
  const gridColor = theme.borderColor.val;
  
  // Chart dimensions with padding
  const padding = 50;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  
  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  
  // Calculate bar dimensions
  const barCount = data.length;
  const barSpacing = 8;
  const availableSpace = orientation === 'vertical' ? chartWidth : chartHeight;
  const barSize = (availableSpace - (barSpacing * (barCount - 1))) / barCount;
  
  // Format value for display
  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
  };
  
  // Generate grid lines
  const generateGridLines = () => {
    const lines = [];
    const gridCount = 4;
    
    if (orientation === 'vertical') {
      // Horizontal grid lines for vertical bars
      for (let i = 0; i <= gridCount; i++) {
        const y = padding + (i / gridCount) * chartHeight;
        lines.push(
          <Line
            key={`grid-${i}`}
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
    } else {
      // Vertical grid lines for horizontal bars
      for (let i = 0; i <= gridCount; i++) {
        const x = padding + (i / gridCount) * chartWidth;
        lines.push(
          <Line
            key={`grid-${i}`}
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
    }
    
    return lines;
  };
  
  // Generate axis labels
  const generateAxisLabels = () => {
    const labels = [];
    const gridCount = 4;
    
    if (orientation === 'vertical') {
      // Y-axis labels for vertical bars
      for (let i = 0; i <= gridCount; i++) {
        const value = (maxValue / gridCount) * (gridCount - i);
        const y = padding + (i / gridCount) * chartHeight;
        labels.push(
          <SvgText
            key={`y-label-${i}`}
            x={padding - 10}
            y={y + 4}
            fontSize="10"
            fill={secondaryText}
            textAnchor="end"
          >
            {formatValue(value)}
          </SvgText>
        );
      }
    } else {
      // X-axis labels for horizontal bars
      for (let i = 0; i <= gridCount; i++) {
        const value = (maxValue / gridCount) * i;
        const x = padding + (i / gridCount) * chartWidth;
        labels.push(
          <SvgText
            key={`x-label-${i}`}
            x={x}
            y={height - 10}
            fontSize="10"
            fill={secondaryText}
            textAnchor="middle"
          >
            {formatValue(value)}
          </SvgText>
        );
      }
    }
    
    return labels;
  };
  
  // Render bars
  const renderBars = () => {
    return data.map((item, index) => {
      const barValue = (item.value / maxValue);
      
      if (orientation === 'vertical') {
        // Vertical bars
        const barHeight = barValue * chartHeight;
        const x = padding + index * (barSize + barSpacing);
        const y = padding + chartHeight - barHeight;
        
        return (
          <TouchableOpacity
            key={`bar-${index}`}
            onPress={() => onBarPress?.(item, index)}
          >
            <Rect
              x={x}
              y={y}
              width={barSize}
              height={barHeight}
              fill={item.color}
              rx={4}
              ry={4}
            />
            
            {/* Value label on top of bar */}
            {showValues && (
              <SvgText
                x={x + barSize / 2}
                y={y - 8}
                fontSize="10"
                fill={primaryText}
                textAnchor="middle"
                fontWeight="600"
              >
                {formatValue(item.value)}
              </SvgText>
            )}
            
            {/* Category name below bar */}
            <SvgText
              x={x + barSize / 2}
              y={height - 25}
              fontSize="10"
              fill={secondaryText}
              textAnchor="middle"
              transform={`rotate(-45, ${x + barSize / 2}, ${height - 25})`}
            >
              {item.name.length > 8 ? item.name.substring(0, 8) + '...' : item.name}
            </SvgText>
          </TouchableOpacity>
        );
      } else {
        // Horizontal bars
        const barWidth = barValue * chartWidth;
        const x = padding;
        const y = padding + index * (barSize + barSpacing);
        
        return (
          <TouchableOpacity
            key={`bar-${index}`}
            onPress={() => onBarPress?.(item, index)}
          >
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barSize}
              fill={item.color}
              rx={4}
              ry={4}
            />
            
            {/* Value label at end of bar */}
            {showValues && (
              <SvgText
                x={x + barWidth + 8}
                y={y + barSize / 2 + 4}
                fontSize="10"
                fill={primaryText}
                textAnchor="start"
                fontWeight="600"
              >
                {formatValue(item.value)}
              </SvgText>
            )}
            
            {/* Category name at start of bar */}
            <SvgText
              x={padding - 10}
              y={y + barSize / 2 + 4}
              fontSize="10"
              fill={secondaryText}
              textAnchor="end"
            >
              {item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name}
            </SvgText>
          </TouchableOpacity>
        );
      }
    });
  };
  
  return (
    <View>
      {/* Chart Container */}
      <RNView style={{ alignItems: 'center' }}>
        <Svg width={width} height={height}>
          {/* Grid lines */}
          {showGrid && generateGridLines()}
          
          {/* Axis labels */}
          {generateAxisLabels()}
          
          {/* Bars */}
          {renderBars()}
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
            Total Items
          </Text>
          <Text fontSize="$4" fontWeight="600" color={primaryText}>
            {data.length}
          </Text>
        </RNView>
        
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
            Total Value
          </Text>
          <Text fontSize="$4" fontWeight="600" color={primaryText}>
            {formatValue(data.reduce((sum, item) => sum + item.value, 0))}
          </Text>
        </RNView>
      </RNView>
    </View>
  );
};

export default BarChart; 