import { Header } from "@/components/header";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart, PieChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

export default function Relatorios() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados dos KPIs
  const [kpiFaturamentoHoje, setKpiFaturamentoHoje] = useState({ faturamento_hoje: 0 });
  const [kpiUnidadesHoje, setKpiUnidadesHoje] = useState({ unidades_vendidas_hoje: 0 });
  const [kpiDevolucoesPendentes, setKpiDevolucoesPendentes] = useState({ devolucoes_pendentes: 0 });
  const [kpiProximaDevolucao, setKpiProximaDevolucao] = useState({ proxima_data_limite: null });
  const [kpiFaturamento30d, setKpiFaturamento30d] = useState({ faturamento_ultimos_30_dias: 0 });
  const [kpiTicketMedio30d, setKpiTicketMedio30d] = useState({ ticket_medio_ultimos_30_dias: 0 });
  interface Revista {
    nome?: string;
    total_vendido?: number;
  }

  interface Pagamento {
    metodo_pagamento?: string;
    faturamento?: number;
  }

  const [top5Revistas, setTop5Revistas] = useState<Revista[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);

  // Função para buscar dados da API
  const fetchDados = async () => {
    try {
      const [
        dataFatHoje,
        dataUnidHoje,
        dataDevPend,
        dataProxDev,
        dataFat30d,
        dataTicket,
        dataTop5,
        dataPagamentos
      ] = await Promise.all([
        apiService.relatorios.kpiFaturamentoHoje().catch(() => ({ faturamento_hoje: 0 })),
        apiService.relatorios.kpiUnidadesHoje().catch(() => ({ unidades_vendidas_hoje: 0 })),
        apiService.relatorios.kpiDevolucoesPendentes().catch(() => ({ devolucoes_pendentes: 0 })),
        apiService.relatorios.kpiProximaDevolucao().catch(() => ({ proxima_data_limite: null })),
        apiService.relatorios.kpiFaturamento30d().catch(() => ({ faturamento_ultimos_30_dias: 0 })),
        apiService.relatorios.kpiTicketMedio30d().catch(() => ({ ticket_medio_ultimos_30_dias: 0 })),
        apiService.relatorios.graficoTop5RevistasSemanal().catch(() => []),
        apiService.relatorios.graficoVendasPorPagamento30d().catch(() => [])
      ]);

      setKpiFaturamentoHoje({ faturamento_hoje: dataFatHoje?.faturamento_hoje ?? 0 });
      setKpiUnidadesHoje({ unidades_vendidas_hoje: dataUnidHoje?.unidades_vendidas_hoje ?? 0 });
      setKpiDevolucoesPendentes({ devolucoes_pendentes: dataDevPend?.devolucoes_pendentes ?? 0 });
      setKpiProximaDevolucao({ proxima_data_limite: dataProxDev?.proxima_data_limite || null });
      setKpiFaturamento30d({ faturamento_ultimos_30_dias: dataFat30d?.faturamento_ultimos_30_dias ?? 0 });
      setKpiTicketMedio30d({ ticket_medio_ultimos_30_dias: dataTicket?.ticket_medio_ultimos_30_dias ?? 0 });

      if (Array.isArray(dataTop5) && dataTop5.length > 0) {
        setTop5Revistas(dataTop5);
      }

      if (Array.isArray(dataPagamentos) && dataPagamentos.length > 0) {
        setPagamentos(dataPagamentos);
      }

    } catch (error) {
      console.error('Erro geral ao buscar dados do dashboard:', error);
    }
  };

  useEffect(() => {
    fetchDados().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDados();
    setRefreshing(false);
  };

  interface CurrencyFormatter {
    (value: number | null | undefined): string;
  }

  const formatCurrency: CurrencyFormatter = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
    return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
  };

  interface DateFormatter {
    (dateString: string | null): string;
  }

  const formatDate: DateFormatter = (dateString) => {
    if (!dateString) return t('notAvailable');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return t('notAvailable');
    }
  };

  // Transformar dados para gráficos
  const chartTop5Data = top5Revistas.map((item, index) => ({
    value: item.total_vendido || 0,
    label: item.nome || '',
    frontColor: ['#E67E22', '#D35400', '#27AE60', '#E74C3C', '#F39C12'][index] || '#95A5A6'
  }));

  const totalFaturamento = pagamentos.reduce((acc, item) => acc + (item.faturamento || 0), 0);
  const chartPagamentosData = pagamentos.map((item, index) => {
    const percentual = totalFaturamento > 0
      ? (((item.faturamento ?? 0) / totalFaturamento) * 100).toFixed(0)
      : 0;
    return {
      value: parseFloat(percentual.toString()),
      color: ['#E67E22', '#27AE60', '#3498DB', '#F39C12'][index] || '#95A5A6',
      text: `${percentual}%`,
      label: item.metodo_pagamento || ''
    };
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header usuario="Andrea" pagina={t('reportsAndInsights')} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E67E22" />
          <Text style={styles.loadingText}>{t('loadingData')}</Text>
        </View>
        {/* <BottomNav /> FOI REMOVIDO DAQUI */}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header usuario="Andrea" pagina={t('reportsAndInsights')} />

      <ScrollView
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* KPI Cards - Linha 1 */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, styles.kpiCardPrimary]}>
            <Text style={styles.kpiLabel}>{t('revenueToday')}</Text>
            <Text style={styles.kpiValue}>
              {formatCurrency(kpiFaturamentoHoje.faturamento_hoje)}
            </Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardSecondary]}>
            <Text style={styles.kpiLabel}>{t('unitsToday')}</Text>
            <Text style={styles.kpiValue}>{kpiUnidadesHoje.unidades_vendidas_hoje}</Text>
          </View>
        </View>

        {/* KPI Cards - Linha 2 */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, styles.kpiCardWarning]}>
            <Text style={styles.kpiLabel}>{t('pendingReturns')}</Text>
            <Text style={styles.kpiValue}>{kpiDevolucoesPendentes.devolucoes_pendentes}</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardInfo]}>
            <Text style={styles.kpiLabel}>{t('nextReturn')}</Text>
            <Text style={styles.kpiValueSmall}>
              {formatDate(kpiProximaDevolucao.proxima_data_limite)}
            </Text>
          </View>
        </View>

        {/* KPI Cards - Linha 3 */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, styles.kpiCardSuccess]}>
            <Text style={styles.kpiLabel}>{t('revenue30d')}</Text>
            <Text style={styles.kpiValue}>
              {formatCurrency(kpiFaturamento30d.faturamento_ultimos_30_dias)}
            </Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardOrange]}>
            <Text style={styles.kpiLabel}>{t('averageTicket30d')}</Text>
            <Text style={styles.kpiValue}>
              {formatCurrency(kpiTicketMedio30d.ticket_medio_ultimos_30_dias)}
            </Text>
          </View>
        </View>

        {/* Gráfico 1 - Top 5 Revistas */}
        {chartTop5Data.length > 0 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>{t('top5MagazinesWeekly')}</Text>
            <View style={styles.chartWrapper}>
              <BarChart
                data={chartTop5Data}
                width={width - 80}
                noOfSections={2}
                maxValue={Math.max(...chartTop5Data.map(d => d.value + 0.4))}
                height={280}
                barWidth={40}
                spacing={25}
                hideRules
                xAxisThickness={1}
                yAxisThickness={1}
                xAxisColor="#D6DBDF"
                yAxisColor="#D6DBDF"
                yAxisTextStyle={styles.axisLabel}
                xAxisLabelTextStyle={styles.barChartLabel}
                isAnimated
                animationDuration={800}

                renderTooltip={(item:any, index:any) => {
                   const maxAltura = Math.max(...chartTop5Data.map(d => d.value * 1.5))
                   const ultimo = chartTop5Data.length - 1;
                   // @ts-ignore
                   let tooltipStyle = {
                         position: 'absolute',
                   };
                   if (item.value > maxAltura / 3) {
                     // @ts-ignore
                       tooltipStyle.top = 0;
                     // @ts-ignore

                   } else tooltipStyle.bottom = 0;
                   // @ts-ignore
                   if (ultimo == index) tooltipStyle.right = 0;

                    return (
                        // @ts-ignore
                        <View style={[styles.tooltip, tooltipStyle]}>
                            <View style={styles.tooltipContent}>
                                <Text style={styles.tooltipLabel}>{item.label}</Text>
                                <Text style={[styles.tooltipValue]}>
                                  Qtd. Vendida {item.value}
                                </Text>
                            </View>
                        </View>
                    );
                  }}
              />
            </View>
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>{t('top5MagazinesWeekly')}</Text>
            <Text style={styles.emptyText}>{t('noSalesToday')}</Text>
          </View>
        )}

        {/* Gráfico 2 - Métodos de Pagamento */}
        {chartPagamentosData.length > 0 && totalFaturamento > 0 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>
              {t('salesByPayment30d')}
            </Text>
            <View style={styles.pieChartWrapper}>
              <PieChart
                data={chartPagamentosData}
                donut
                innerRadius={90}
                radius={160}
                centerLabelComponent={() => (
                  <View style={styles.centerLabel}>
                    <Text style={styles.centerLabelText}>{t('total')}</Text>
                    <Text style={styles.centerLabelValue}>{formatCurrency(totalFaturamento)}</Text>
            </View>
                )}
                showText
                textColor="#fff"
                textSize={15}
                fontWeight="bold"
              />

              {/* Legenda */}
              <View style={styles.legend}>
                {pagamentos.map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View
                      style={[styles.legendColor, { backgroundColor: chartPagamentosData[index]?.color }]}
                    />
                    <Text style={styles.legendText}>{item.metodo_pagamento}</Text>
                    <Text style={styles.legendValue}>{formatCurrency(item.faturamento)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>
              {t('salesByPayment30d')}
            </Text>
            <Text style={styles.emptyText}>{t('noSalesLast30Days')}</Text>
          </View>
        )}
      </ScrollView>

      {/* <BottomNav /> FOI REMOVIDO DAQUI */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scrollViewContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 90, // Mantenha um padding inferior para o scroll
  },
  // bottomNavContainer: { ... } FOI REMOVIDO DAQUI
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  kpiCardPrimary: {
    backgroundColor: '#E67E22',
  },
  kpiCardSecondary: {
    backgroundColor: '#D35400',
  },
  kpiCardWarning: {
    backgroundColor: '#E74C3C',
  },
  kpiCardInfo: {
    backgroundColor: '#27AE60',
  },
  kpiCardSuccess: {
    backgroundColor: '#16A085',
  },
  kpiCardOrange: {
    backgroundColor: '#F39C12',
  },
  kpiLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.95,
    marginBottom: 8,
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  kpiValueSmall: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#2C3E50",
  },
  chartWrapper: {
    alignItems: 'center',
  },
  pieChartWrapper: {
    alignItems: 'center',
  },
  centerLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabelText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  centerLabelValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  legend: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 10,
  },
  legendText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  legendValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E67E22',
  },
  axisLabel: {
    fontSize: 11,
    color: '#7F8C8D',
  },
  barChartLabel: {
    fontSize: 13,
    color: '#2C3E50',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  tooltip: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 120,
    maxWidth: width * 0.5,
    minHeight: 120
  },

  tooltipContent: {
    flexDirection: 'column',
    gap: 4,
  },

  tooltipLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },

  tooltipValue: {
    color: '#f9f9f9',
    fontSize: 14,
    fontWeight: '500'
  }
});