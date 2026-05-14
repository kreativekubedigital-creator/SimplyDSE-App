import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Note: In a real app, you'd load actual fonts. Using defaults for simplicity.
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#1e293b',
    paddingBottom: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    marginBottom: 10,
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  reportTitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  confidentialBadge: {
    backgroundColor: '#f1f5f9',
    padding: '4 8',
    borderRadius: 4,
    marginTop: 10,
  },
  confidentialText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: 'bold',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metaCol: {
    width: '50%',
    marginBottom: 10,
  },
  metaLabel: {
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 6,
    marginTop: 20,
  },
  riskEngineBox: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  riskEngineLeft: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  riskEngineRight: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  scoreBig: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  riskBadge: {
    padding: '6 12',
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  riskBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  categoryTable: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: '8 12',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tableHeaderCell: {
    fontSize: 10,
    color: '#475569',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: '10 12',
    alignItems: 'center',
  },
  colCat: { width: '50%' },
  colScore: { width: '20%' },
  colRisk: { width: '30%', alignItems: 'flex-end' },
  catName: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  catScore: {
    fontSize: 11,
    color: '#64748b',
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  riskLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  list: {
    marginTop: 5,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 4,
    height: 4,
    backgroundColor: '#94a3b8',
    borderRadius: 2,
    marginTop: 5,
    marginRight: 8,
  },
  listText: {
    fontSize: 11,
    color: '#334155',
    flex: 1,
    lineHeight: 1.4,
  },
  recommendationBox: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    padding: 12,
    marginBottom: 10,
  },
  recTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  recDesc: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 9,
    color: '#94a3b8',
  }
});

const getRiskColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'low': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'high': return '#f43f5e';
    case 'critical': return '#9f1239';
    default: return '#64748b';
  }
};

const getRiskLabel = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'low': return 'Low Risk';
    case 'medium': return 'Medium Risk';
    case 'high': return 'High Risk';
    case 'critical': return 'Critical Risk';
    default: return 'Unknown Risk';
  }
};

export interface AssessmentDataProps {
  employeeName: string;
  companyName: string;
  assessmentDate: string;
  assessmentId: string;
  overallScore: number;
  overallRiskLevel: string;
  categories: {
    name: string;
    score: number;
    maxScore: number;
    riskLevel: string;
  }[];
  strengths: string[];
  improvements: string[];
  recommendations: {
    title: string;
    description: string;
  }[];
}

export const AssessmentReportPDF: React.FC<{ data: AssessmentDataProps }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.brandName}>SimplyDSE</Text>
          <Text style={styles.reportTitle}>DSE Assessment Report</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.confidentialBadge}>
            <Text style={styles.confidentialText}>CONFIDENTIAL</Text>
          </View>
        </View>
      </View>

      {/* Meta Data */}
      <View style={styles.metaGrid}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Employee Name</Text>
          <Text style={styles.metaValue}>{data.employeeName}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Company</Text>
          <Text style={styles.metaValue}>{data.companyName}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Assessment Date</Text>
          <Text style={styles.metaValue}>{data.assessmentDate}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Assessment ID</Text>
          <Text style={styles.metaValue}>{data.assessmentId}</Text>
        </View>
      </View>

      {/* Overall Risk Engine */}
      <Text style={styles.sectionTitle}>Overall Risk Assessment</Text>
      <View style={styles.riskEngineBox}>
        <View style={styles.riskEngineLeft}>
          <Text style={styles.scoreBig}>{data.overallScore}<Text style={{fontSize: 20, color: '#64748b'}}>/100</Text></Text>
          <Text style={styles.scoreLabel}>Total Risk Score</Text>
        </View>
        <View style={styles.riskEngineRight}>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(data.overallRiskLevel) }]}>
            <Text style={styles.riskBadgeText}>{getRiskLabel(data.overallRiskLevel)}</Text>
          </View>
          <Text style={{fontSize: 10, color: '#64748b', marginTop: 8}}>Based on weighted category aggregation</Text>
        </View>
      </View>

      {/* Category Performance */}
      <Text style={styles.sectionTitle}>Category Performance</Text>
      <View style={styles.categoryTable}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.colCat]}>Category</Text>
          <Text style={[styles.tableHeaderCell, styles.colScore]}>Score</Text>
          <Text style={[styles.tableHeaderCell, styles.colRisk]}>Risk Severity</Text>
        </View>
        {data.categories.map((cat, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.catName, styles.colCat]}>{cat.name}</Text>
            <Text style={[styles.catScore, styles.colScore]}>{cat.score}/{cat.maxScore}</Text>
            <View style={[styles.colRisk, { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }]}>
              <View style={[styles.riskDot, { backgroundColor: getRiskColor(cat.riskLevel) }]} />
              <Text style={[styles.riskLabel, { color: getRiskColor(cat.riskLevel) }]}>{getRiskLabel(cat.riskLevel).toUpperCase()}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Strengths & Improvements side by side */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: '48%' }}>
          <Text style={[styles.sectionTitle, { color: '#10b981', borderBottomColor: '#10b981' }]}>Key Strengths</Text>
          <View style={styles.list}>
            {data.strengths.length > 0 ? data.strengths.map((item, i) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: '#10b981' }]} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            )) : (
              <Text style={styles.listText}>No specific strengths identified in this assessment.</Text>
            )}
          </View>
        </View>
        <View style={{ width: '48%' }}>
          <Text style={[styles.sectionTitle, { color: '#f43f5e', borderBottomColor: '#f43f5e' }]}>Areas for Improvement</Text>
          <View style={styles.list}>
            {data.improvements.length > 0 ? data.improvements.map((item, i) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: '#f43f5e' }]} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            )) : (
              <Text style={styles.listText}>No critical improvements required at this time.</Text>
            )}
          </View>
        </View>
      </View>

      {/* Recommendations */}
      <Text style={styles.sectionTitle}>Actionable Recommendations</Text>
      {data.recommendations.length > 0 ? data.recommendations.map((rec, i) => (
        <View key={i} style={styles.recommendationBox}>
          <Text style={styles.recTitle}>{rec.title}</Text>
          <Text style={styles.recDesc}>{rec.description}</Text>
        </View>
      )) : (
        <Text style={styles.listText}>Your workstation setup meets compliance standards. No specific actions required.</Text>
      )}

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>SimplyDSE Enterprise Compliance Engine</Text>
        <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
      </View>
    </Page>
  </Document>
);
