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
  size = 250,
  showLabels = false,
  showLegend = true,
  onSegmentPress
}) => {
  const theme = useTheme();
  const primaryText = '#000000';
  const secondaryText = '#8E8E93';
  
  // Validate data
  if (!data || data.length === 0) {
    return (
      <View>
        <RNView style={{ alignItems: 'center', padding: 20 }}>
          <Text fontSize="$3" color={secondaryText}>No data available</Text>
        </RNView>
      </View>
    );
  }

  // Calculate center and radius
  const center = size / 2;
  const radius = size / 2 - 30; // Leave more space for labels
  
  // Calculate total and validate
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  
  if (total === 0) {
    return (
      <View>
        <RNView style={{ alignItems: 'center', padding: 20 }}>
          <Text fontSize="$3" color={secondaryText}>No spending data</Text>
        </RNView>
      </View>
    );
  }

  // Calculate angles for each segment
  let currentAngle = -90; // Start from top
  
  const segments = data.map((item, index) => {
    const value = item.value || 0;
    const angle = (value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    return {
      ...item,
      startAngle,
      endAngle,
      angle,
      value
    };
  });
  
  // Function to create SVG path for pie segment
  const createPath = (startAngle: number, endAngle: number) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
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
      <RNView style={{ alignItems: 'center', marginBottom: 20 }}>
        <Svg width={size} height={size}>
          {/* Render pie segments */}
          {segments.map((segment, index) => {
            if (segment.value <= 0 || segment.angle <= 0) return null;
            
            return (
              <Path
                key={`segment-${index}`}
                d={createPath(segment.startAngle, segment.endAngle)}
                fill={segment.color || '#E5E5EA'}
                stroke="white"
                strokeWidth={2}
                onPress={() => handleSegmentPress(segment)}
              />
            );
          })}
          
          {/* Center circle for donut effect */}
          <Circle
            cx={center}
            cy={center}
            r={radius * 0.5}
            fill="white"
            stroke="#E5E5EA"
            strokeWidth={1}
          />
          
          {/* Total amount in center */}
          <SvgText
            x={center}
            y={center - 12}
            fontSize="18"
            fill={primaryText}
            fontWeight="700"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            ${total.toFixed(0)}
          </SvgText>
          <SvgText
            x={center}
            y={center + 16}
            fontSize="14"
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
        <RNView style={{ gap: 12 }}>
          {data.map((item, index) => (
            <TouchableOpacity
              key={`legend-${index}`}
              onPress={() => handleSegmentPress(item)}
            >
              <RNView style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingVertical: 8,
                minHeight: 44
              }}>
                <RNView style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  flex: 1,
                  marginRight: 16
                }}>
                  {/* Color indicator */}
                  <RNView style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: item.color || '#E5E5EA',
                    marginRight: 12
                  }} />
                  
                  {/* Category name */}
                  <Text 
                    fontSize="$3" 
                    fontWeight="500"
                    color={primaryText}
                    numberOfLines={1}
                    flex={1}
                  >
                    {item.name}
                  </Text>
                </RNView>
                
                {/* Amount and percentage */}
                <RNView style={{ 
                  alignItems: 'flex-end',
                  minWidth: 80,
                  flexShrink: 0
                }}>
                  <Text fontSize="$3" fontWeight="600" color={primaryText}>
                    ${(item.value || 0).toFixed(0)}
                  </Text>
                  <Text fontSize="$2" color={secondaryText} marginTop={2}>
                    {((item.value || 0) / total * 100).toFixed(1)}%
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