import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme 
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import * as d3 from 'd3';
import EmployeeCard from './EmployeeCard';
import { loadBookmarks } from '../../../store/slices/bookmarkSlice';
import styles from './GraphView.module.css';

const GraphView = ({ data }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Get employee ID from URL
  const currentPath = location.pathname;
  const employeeId = currentPath.includes('/employee/') 
    ? currentPath.split('/employee/')[1]
    : null;
  
  const isDarkMode = theme.palette.mode === 'dark';
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [dimensions, setDimensions] = useState(null);
  const [hierarchyData, setHierarchyData] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load bookmarks when component mounts
  useEffect(() => {
    dispatch(loadBookmarks());
  }, [dispatch]);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!data || !dimensions?.width || !dimensions?.height) return;
  
    const treeLayout = d3.tree()
      .nodeSize([200, 400])
      .separation((a, b) => {
        const baseSeparation = a.parent === b.parent ? 1.2 : 2;
        const depthFactor = Math.min(a.depth, b.depth) * 0.1;
        return baseSeparation + depthFactor;
      });
  
    const root = d3.hierarchy(data);
    const processedRoot = treeLayout(processHierarchyData(root, employeeId));
    setHierarchyData(processedRoot);
  
    // Auto-center on selection change
    if (employeeId) {
      const selectedNode = processedRoot.descendants()
        .find(node => normalizeId(node.data.id) === normalizeId(employeeId));
      
      if (selectedNode) {
        setIsTransitioning(true);
        const { tx, ty, scale } = calculateCenterTransform(selectedNode, dimensions);
        handleAutoZoom(tx, ty, scale);
      }
    } else {
      const { tx, ty, scale } = calculateCenterTransform(processedRoot, dimensions);
      handleAutoZoom(tx, ty, scale);
    }
  }, [data, dimensions, employeeId]);
  // Calculate transform to center on selected node with proper zoom handling
  const calculateCenterTransform = (node, dimensions) => {
    if (!node) return { tx: 0, ty: 0, scale: 1 };
  
    // Get all visible nodes (nodes that are actually rendered)
    const visibleNodes = node.descendants().filter(d => d.children !== null || !d._children);
    
    if (visibleNodes.length === 0) return { tx: 0, ty: 0, scale: 1 };
  
    // Calculate bounding box of all visible nodes
    const bbox = {
      left: Math.min(...visibleNodes.map(d => d.y)),
      right: Math.max(...visibleNodes.map(d => d.y)),
      top: Math.min(...visibleNodes.map(d => d.x)),
      bottom: Math.max(...visibleNodes.map(d => d.x))
    };
  
    // Add padding
    const padding = 100;
    const width = (bbox.right - bbox.left) + (padding * 2);
    const height = (bbox.bottom - bbox.top) + (padding * 2);
  
    // Calculate scale to fit the visible nodes
    const scaleX = dimensions.width / width;
    const scaleY = dimensions.height / height;
    let scale = Math.min(scaleX, scaleY);
  
    // Bound the scale between 0.4 and 1.2
    scale = Math.min(1.2, Math.max(0.4, scale * 0.9));
  
    // Calculate center position
    const tx = (dimensions.width / 2) - ((bbox.right + bbox.left) / 2 * scale);
    const ty = (dimensions.height / 2) - ((bbox.bottom + bbox.top) / 2 * scale);
  
    return { tx, ty, scale };
  };

  // Process the hierarchy data
  const processHierarchyData = (root, employeeId) => {
    if (!root) return;
  
    // Find selected node
    const selectedNode = employeeId ? 
      root.descendants().find(n => 
        normalizeId(n.data.id) === normalizeId(employeeId)
      ) : null;
  
    // Track nodes that should be expanded
    const expandedNodes = new Set();
  
    // First pass: mark nodes that should be visible
    root.descendants().forEach(node => {
      const { isSelected, isParent, isChild } = getNodeRelations(node, employeeId);
      let shouldShow = false;
  
      // If no employee is selected (root view), show all nodes
      if (!employeeId) {
        shouldShow = true;
      } else {
        // Always show root
        if (node === root) {
          shouldShow = true;
        }
  
        // Show selected node and immediate family
        if (isSelected || isParent || isChild) {
          shouldShow = true;
        }
  
        // Show ancestors (path to root) of selected node
        if (selectedNode) {
          let current = selectedNode;
          while (current) {
            if (current === node) {
              shouldShow = true;
              break;
            }
            current = current.parent;
          }
        }
  
        // Show siblings of selected node
        if (selectedNode && node.parent === selectedNode.parent) {
          shouldShow = true;
        }
  
        // Show descendants up to 3 levels deep from selected node
        if (selectedNode) {
          let current = node;
          let level = 0;
          while (current && current !== selectedNode) {
            level++;
            current = current.parent;
          }
          if (current && level <= 3) {
            shouldShow = true;
          }
        }
      }
  
      if (shouldShow) {
        expandedNodes.add(node);
        // If this is the selected node, add its descendants up to 3 levels
        if (isSelected) {
          let queue = [[node, 0]];
          while (queue.length > 0) {
            const [current, level] = queue.shift();
            if (level >= 3) continue;
            
            current.children?.forEach(child => {
              expandedNodes.add(child);
              queue.push([child, level + 1]);
            });
          }
        }
      }
    });
  
    // Second pass: apply visibility
    root.descendants().forEach(node => {
      if (!employeeId) {
        // In root view, show all nodes
        node._children = null;
      } else if (!expandedNodes.has(node) && node.children) {
        // Store and hide children for non-visible nodes
        node._children = node.children;
        node.children = null;
      } else {
        // Show children for visible nodes
        node._children = null;
        
        // For nodes at level 3 from selected, store their children
        if (selectedNode) {
          let current = node;
          let level = 0;
          while (current && current !== selectedNode) {
            level++;
            current = current.parent;
          }
          if (current && level === 3 && node.children) {
            node._children = node.children;
            node.children = null;
          }
        }
      }
    });
  
    return root;
  };
  

  // Calculate initial view transform
  const calculateInitialTransform = (root, dimensions) => {
    if (!root) return { tx: 0, ty: 0, scale: 1 };

    let minY = Infinity, maxY = -Infinity;
    let minX = Infinity, maxX = -Infinity;

    root.descendants().forEach(d => {
      if (d.depth <= 2) { // Only consider visible nodes
        minX = Math.min(minX, d.x);
        maxX = Math.max(maxX, d.x);
        minY = Math.min(minY, d.y);
        maxY = Math.max(maxY, d.y);
      }
    });
    const padding = 100;
    const treeWidth = (maxY - minY) + (padding * 2);
    const treeHeight = (maxX - minX) + (padding * 2);
    
    const scaleX = dimensions.width / treeWidth;
    const scaleY = dimensions.height / treeHeight;
    const scale = Math.min(0.8, Math.min(scaleX, scaleY) * 0.8);

    const tx = dimensions.width / 2 - ((maxY + minY) / 2) * scale;
    const ty = dimensions.height / 2 - ((maxX + minX) / 2) * scale;

    return { tx, ty, scale };
  };

  // Auto zoom handler with transition
  const handleAutoZoom = (tx, ty, scale) => {
    if (!svgRef.current || isTransitioning) return;
  
    setIsTransitioning(true);
    const svg = d3.select(svgRef.current);

    // Create zoom behavior with constraints
    const zoom = d3.zoom()
      .scaleExtent([0.3, 2])
      .translateExtent([
        [-dimensions.width * 2, -dimensions.height * 2],
        [dimensions.width * 2, dimensions.height * 2]
      ]);
  
    svg.transition()
      .duration(750)
      .ease(d3.easeCubicInOut) // Smoother easing
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(tx, ty)
          .scale(scale)
      )
      .on('start', () => {
        setIsTransitioning(true);
      })
      .on('end', () => {
        setIsTransitioning(false);
        setTransform({ x: tx, y: ty, k: scale });
      });
  
    setTransform({ x: tx, y: ty, k: scale });
  };

  // Manual zoom handlers
  const handleZoom = (factor) => {
    if (!svgRef.current || !hierarchyData || isTransitioning) return;

    const newScale = transform.k * factor;
    if (newScale >= 0.3 && newScale <= 2) {
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom()
        .scaleExtent([0.3, 2])
        .on('zoom', (event) => {
          if (!isTransitioning) {
            setTransform({
              x: event.transform.x,
              y: event.transform.y,
              k: event.transform.k
            });
          }
        });
      
      svg.transition()
        .duration(300)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(transform.x, transform.y)
            .scale(newScale)
        );

        setTransform(prev => ({
          ...prev,
          k: newScale
        }));
    }
  };

  // Handle reset view
  const handleReset = () => {
    if (isTransitioning || !hierarchyData || !dimensions) return;
    
    // Navigate to root view first
    navigate('/org-chart');
    
    // Calculate initial transform for the entire tree
    const { tx, ty, scale } = calculateInitialTransform(hierarchyData, dimensions);
    
    // Apply the zoom reset with a slight delay to allow for navigation
    setTimeout(() => {
      handleAutoZoom(tx, ty, scale);
    }, 100);
  };

  // Setup zoom behavior
  useEffect(() => {
    if (!svgRef.current || !dimensions) return;

    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom()
      .scaleExtent([0.3, 2])
      .on('zoom', (event) => {
        if (!isTransitioning) {
          setTransform({
            x: event.transform.x,
            y: event.transform.y,
            k: event.transform.k
          });
        }
      });

    svg.call(zoom);

    return () => {
      svg.on('.zoom', null);
    };
  }, [dimensions, isTransitioning]);

  // Handle node click
  const handleNodeClick = (employeeId) => {
    if (!isTransitioning) {
      const newPath = `/org-chart/employee/${employeeId}`;
      console.log('Navigating to:', newPath);
      navigate(newPath);
    }
  };

  // Helper function to normalize IDs
  const normalizeId = (id) => id?.toString().replace('emp-', '');

  const getNodeRelations = (node, employeeId) => {
    const currentEmployeeId = normalizeId(employeeId);
    const nodeId = normalizeId(node.data.id);
  
    // Direct selection check
    const isSelected = currentEmployeeId === nodeId;
  
    // Parent check: check if any of node's children is the selected node
    const isParent = node.children?.some(child => 
      normalizeId(child.data.id) === currentEmployeeId
    ) || false;
  
    // Child check: check if node's parent is the selected node
    const isChild = node.parent && normalizeId(node.parent.data.id) === currentEmployeeId;
  
    return { isSelected, isParent, isChild };
  };

  // Render functions
  const renderLinks = () => {
    if (!hierarchyData) return null;
  
    return hierarchyData.links().map((link, i) => {
      const isSelectedPath = employeeId && (
        link.source.data.id === employeeId ||
        link.target.data.id === employeeId ||
        link.source.data.id === data?.managerId ||
        link.target.data.id === data?.managerId
      );
  
      const path = d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x);
  
      const linkClasses = [
        styles.link,
        isSelectedPath ? styles.selected : ''
      ].filter(Boolean).join(' ');
  
      return (
        <path
          key={`link-${i}`}
          d={path(link)}
          className={linkClasses}
          style={{
            stroke: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
            strokeWidth: isSelectedPath ? '3' : '1',
            strokeDasharray: isSelectedPath ? 'none' : '4'
          }}
        />
      );
    });
  };

  const renderNodes = () => {
    if (!hierarchyData) return null;
  
    return hierarchyData.descendants().map((node) => {
      const { isSelected, isParent, isChild } = getNodeRelations(node, employeeId);
      const nodeClasses = [
        styles.nodeContainer,
        isSelected ? styles.selected : '',
        isParent ? styles.parent : '',
        isChild ? styles.child : '',
        node === hierarchyData ? styles.root : ''  // Add root styling
      ].filter(Boolean).join(' ');
  
      return (
        <foreignObject
          key={node.data.id}
          x={node.y - 160}
          y={node.x - 80}
          width={320}
          height={160}
          className={nodeClasses}
        >
          <EmployeeCard 
            employee={node.data}
            isSelected={isSelected}
            isParentOfSelected={isParent}
            isChildOfSelected={isChild}
            onSelect={() => handleNodeClick(node.data.id)}
            disabled={isTransitioning}
          />
        </foreignObject>
      );
    });
  };

  if (!dimensions) {
    return (
      <Box 
        ref={containerRef}
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%',
          minHeight: '500px'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box ref={containerRef} className={styles.graphContainer} data-testid="graph-view">
      {/* Zoom Controls */}
      <Box className={styles.zoomControls} data-testid="zoom-controls">
        <Tooltip title="Zoom In">
          <IconButton 
            onClick={() => handleZoom(1.2)} 
            size="small"
            disabled={transform.k >= 2 || isTransitioning}
            data-testid="zoom-in"
          >
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton 
            onClick={() => handleZoom(0.8)} 
            size="small"
            disabled={transform.k <= 0.3 || isTransitioning}
            data-testid="zoom-out"
          >
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset View">
          <IconButton 
            onClick={handleReset}
            size="small"
            disabled={isTransitioning}
          >
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* SVG Graph */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className={styles.graphSvg}
      >
        <g
          transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
          style={{ transition: isTransitioning ? 'transform 0.75s ease-in-out' : 'none' }}
        >
          <g className={styles.links}>
            {renderLinks()}
          </g>
          <g className={styles.nodes}>
            {renderNodes()}
          </g>
        </g>
      </svg>
    </Box>
  );
};

export default GraphView;