import React from 'react';
import { View as RNView, TouchableOpacity } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

// Interface for pie chart data
export interface PieChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

// Interface for pie chart props
interface PieChartProps {
  data: PieChartData[];
  size?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  onSegmentPress?: (segment: PieChartData) => void;
}

// PieChart component for category breakdown visualization
// Features: Interactive segments, clean design, responsive layout, touch handling
const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 200,
  showLabels = true,
  showLegend = true,
  onSegmentPress
}) => {
  const theme = useTheme();
  const primaryText = theme.color.val;
  const secondaryText = theme.color11?.val || '#64748B';
  
  // Calculate center and radius
  const center = size / 2;
  const radius = size / 2 - 20; // Leave space for labels
  
  // Calculate angles for each segment
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90; // Start from top
  
  const segments = data.map((item) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    return {
      ...item,
      startAngle,
      endAngle,
      angle
    };
  });
  
  // Function to create SVG path for pie segment
  const createPath = (startAngle: number, endAngle: number, radius: number) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };
  
  // Function to get label position
  const getLabelPosition = (startAngle: number, endAngle: number, radius: number) => {
    const midAngle = (startAngle + endAngle) / 2;
    const midAngleRad = (midAngle * Math.PI) / 180;
    const labelRadius = radius * 0.7; // Position labels inside segments
    
    return {
      x: center + labelRadius * Math.cos(midAngleRad),
      y: center + labelRadius * Math.sin(midAngleRad)
    };
  };
  
  // Handle segment press
  const handleSegmentPress = (segment: PieChartData) => {
    if (onSegmentPress) {
      onSegmentPress(segment);
    }
  };
  
  return (
    <View>
      {/* Chart Container */}
      <RNView style={{ alignItems: 'center', marginBottom: 16 }}>
        <Svg width={size} height={size}>
          {/* Render pie segments */}
          {segments.map((segment, index) => (
            <TouchableOpacity
              key={segment.name}
              onPress={() => handleSegmentPress(segment)}
            >
              <Path
                d={createPath(segment.startAngle, segment.endAngle, radius)}
                fill={segment.color}
                stroke="white"
                strokeWidth={2}
              />
              
              {/* Render labels if enabled and segment is large enough */}
              {showLabels && segment.percentage > 5 && (
                <SvgText
                  x={getLabelPosition(segment.startAngle, segment.endAngle, radius).x}
                  y={getLabelPosition(segment.startAngle, segment.endAngle, radius).y}
                  fontSize="12"
                  fill="white"
                  fontWeight="600"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {segment.percentage.toFixed(0)}%
                </SvgText>
              )}
            </TouchableOpacity>
          ))}
          
          {/* Center circle for donut effect */}
          <Circle
            cx={center}
            cy={center}
            r={radius * 0.4}
            fill={theme.background.val}
            stroke={theme.borderColor.val}
            strokeWidth={1}
          />
          
          {/* Total amount in center */}
          <SvgText
            x={center}
            y={center - 8}
            fontSize="16"
            fill={primaryText}
            fontWeight="700"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            ${total.toLocaleString()}
          </SvgText>
          <SvgText
            x={center}
            y={center + 12}
            fontSize="12"
            fill={secondaryText}
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            Total
          </SvgText>
        </Svg>
      </RNView>
      
      {/* Legend */}
      {showLegend && (
        <RNView style={{ gap: 8 }}>
          {data.map((item, index) => (
            <TouchableOpacity
              key={item.name}
              onPress={() => handleSegmentPress(item)}
            >
              <RNView style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingVertical: 4
              }}>
                <RNView style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  {/* Color indicator */}
                  <RNView style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: item.color,
                    marginRight: 8
                  }} />
                  
                  {/* Category name */}
                  <Text 
                    fontSize="$3" 
                    color={primaryText}
                    numberOfLines={1}
                    flex={1}
                  >
                    {item.name}
                  </Text>
                </RNView>
                
                {/* Amount and percentage */}
                <RNView style={{ alignItems: 'flex-end' }}>
                  <Text fontSize="$3" fontWeight="600" color={primaryText}>
                    ${item.value.toLocaleString()}
                  </Text>
                  <Text fontSize="$2" color={secondaryText}>
                    {item.percentage.toFixed(1)}%
                  </Text>
                </RNView>
              </RNView>
            </TouchableOpacity>
          ))}
        </RNView>
      )}
    </View>
  );
};

export default PieChart; 