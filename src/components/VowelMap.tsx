import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { findNearestVowel, getDisplayVowels, getDialectColor, type DisplayVowel } from '../audio/vowelPresets';
import { useSynth } from '../state/synthStore';

const MARGIN = { top: 30, right: 40, bottom: 50, left: 60 };
const WIDTH = 550;
const HEIGHT = 450;

export function VowelMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const isDraggingRef = useRef(false);
  const { state, dispatch } = useSynth();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

    const xScale = d3.scaleLinear()
      .domain([2500, 500])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([200, 900])
      .range([0, innerHeight]);

    const g = svg.append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line.horizontal')
      .data(yScale.ticks(7))
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#333')
      .attr('stroke-dasharray', '2,2');

    g.append('g')
      .attr('class', 'grid')
      .selectAll('line.vertical')
      .data(xScale.ticks(8))
      .join('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#333')
      .attr('stroke-dasharray', '2,2');

    // X axis (F2)
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .call(g => g.select('.domain').attr('stroke', '#666'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#666'))
      .call(g => g.selectAll('.tick text').attr('fill', '#a0a0b0'));

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a0a0b0')
      .attr('font-size', '12px')
      .text('F2 (Hz) →');

    // Y axis (F1)
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .call(g => g.select('.domain').attr('stroke', '#666'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#666'))
      .call(g => g.selectAll('.tick text').attr('fill', '#a0a0b0'));

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a0a0b0')
      .attr('font-size', '12px')
      .text('F1 (Hz) ↓');

    // Get display vowels with overlap detection
    const displayVowels = getDisplayVowels();

    // Vowel points
    const vowelGroups = g.selectAll('.vowel')
      .data(displayVowels)
      .join('g')
      .attr('class', 'vowel')
      .attr('transform', d => `translate(${xScale(d.f2)},${yScale(d.f1)})`)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        dispatch({ type: 'SET_FORMANTS', payload: { f1: d.f1, f2: d.f2, f3: d.f3 } });
        dispatch({ type: 'SET_F1_BW', payload: d.f1Bw });
        dispatch({ type: 'SET_F2_BW', payload: d.f2Bw });
        dispatch({ type: 'SET_F1_GAIN', payload: d.f1Gain });
        dispatch({ type: 'SET_F2_GAIN', payload: d.f2Gain });
      });

    vowelGroups.append('circle')
      .attr('r', 8)
      .attr('fill', d => getDialectColor(d.effectiveDialect))
      .attr('opacity', 0.85);

    // IPA symbol(s)
    vowelGroups.append('text')
      .attr('dy', -14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e8e8ed')
      .attr('font-size', '16px')
      .attr('font-weight', '600')
      .text(d => {
        if (d.effectiveDialect === 'both' && d.overlappingWith) {
          // Show both IPA symbols if different
          if (d.ipa !== d.overlappingWith.ipa) {
            return `${d.ipa}/${d.overlappingWith.ipa}`;
          }
        }
        return d.ipa;
      });

    // Label(s)
    vowelGroups.append('text')
      .attr('dy', 26)
      .attr('text-anchor', 'middle')
      .attr('fill', '#888')
      .attr('font-size', '10px')
      .text(d => {
        if (d.effectiveDialect === 'both' && d.overlappingWith) {
          return `${d.label}/${d.overlappingWith.label}`;
        }
        return d.label;
      });

    // Draggable cursor
    const cursor = g.append('g')
      .attr('class', 'cursor')
      .attr('transform', `translate(${xScale(state.f2)},${yScale(state.f1)})`);

    cursor.append('circle')
      .attr('r', 16)
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3);

    cursor.append('circle')
      .attr('r', 5)
      .attr('fill', '#ffffff');

    // Helper to update position during drag
    const updatePosition = (x: number, y: number) => {
      const clampedX = Math.max(0, Math.min(innerWidth, x));
      const clampedY = Math.max(0, Math.min(innerHeight, y));
      
      const f2 = xScale.invert(clampedX);
      const f1 = yScale.invert(clampedY);
      const nearest = findNearestVowel(f1, f2);
      
      cursor.attr('transform', `translate(${clampedX},${clampedY})`);
      
      dispatch({ type: 'SET_FORMANTS', payload: { f1, f2, f3: nearest.f3 } });
    };

    // Drag behavior for cursor
    const cursorDrag = d3.drag<SVGGElement, unknown>()
      .on('start', () => { isDraggingRef.current = true; })
      .on('drag', (event) => updatePosition(event.x, event.y))
      .on('end', () => { isDraggingRef.current = false; });

    cursor.call(cursorDrag);

    // Background rect for click-and-drag anywhere
    const bgRect = g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .lower();

    // Drag behavior for background
    const bgDrag = d3.drag<SVGRectElement, unknown>()
      .on('start', (event) => {
        isDraggingRef.current = true;
        const [x, y] = d3.pointer(event, g.node());
        updatePosition(x, y);
      })
      .on('drag', (event) => {
        const [x, y] = d3.pointer(event, g.node());
        updatePosition(x, y);
      })
      .on('end', () => { isDraggingRef.current = false; });

    bgRect.call(bgDrag);

  }, [dispatch]);

  // Update cursor position when state changes (but not during drag)
  useEffect(() => {
    if (!svgRef.current || isDraggingRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
    
    const xScale = d3.scaleLinear()
      .domain([2500, 500])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([200, 900])
      .range([0, innerHeight]);

    svg.select('g').select('.cursor')
      .attr('transform', `translate(${xScale(state.f2)},${yScale(state.f1)})`);

    // Highlight nearest vowel
    const nearest = findNearestVowel(state.f1, state.f2);
    const displayVowels = getDisplayVowels();
    
    svg.selectAll('.vowel circle')
      .attr('fill', (d: unknown) => {
        const vowel = d as DisplayVowel;
        const isNearest = vowel.ipa === nearest.ipa || 
          (vowel.overlappingWith && vowel.overlappingWith.ipa === nearest.ipa);
        return isNearest ? '#ffffff' : getDialectColor(vowel.effectiveDialect);
      })
      .attr('r', (d: unknown) => {
        const vowel = d as DisplayVowel;
        const isNearest = vowel.ipa === nearest.ipa || 
          (vowel.overlappingWith && vowel.overlappingWith.ipa === nearest.ipa);
        return isNearest ? 10 : 8;
      });

  }, [state.f1, state.f2]);

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Vowel Space (F1 × F2)
        </h3>
        {/* Legend */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff6b6b' }}></span>
            <span className="text-[var(--text-secondary)]">American</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4a9eff' }}></span>
            <span className="text-[var(--text-secondary)]">British</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9b6bff' }}></span>
            <span className="text-[var(--text-secondary)]">Both</span>
          </div>
        </div>
      </div>
      <svg ref={svgRef} width={WIDTH} height={HEIGHT} />
    </div>
  );
}
