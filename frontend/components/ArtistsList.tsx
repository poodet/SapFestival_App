import React from 'react';
import { 
  StyleSheet, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  View, 
  Image, 
  Dimensions, 
  Platform,
  RefreshControl 
} from 'react-native';
import Animated from 'react-native-reanimated';
import Collapsible from 'react-native-collapsible';
import imageMapper from '@/components/imageMapper';
import { useArtists } from '@/contexts/DataContext';
import { theme, layout } from '@/constants/theme'; 
import { useHighlight } from '@/contexts/HighlightContext';
import { useHighlightItem } from '@/hooks/useHighlightItem';
import ThemedText from '@/components/ThemedText';
import { extractTime, extractDayName } from '@/services/calendar.service';
import { SubscribeButton } from '@/components/SubscribeButton';

const { width } = Dimensions.get('window');

export default function ArtistsList() {
  const { artists, isLoading, isRefreshing, refetch } = useArtists();
  
  const { 
    animatedStyle, 
    isItemHighlighted, 
    flatListRef,
    currentHighlightId,
  } = useHighlightItem({ 
    items: artists,
    pulseCount: 2,
    category: 'artist',
  });

  const { clearHighlight } = useHighlight();
  const [expandedArtist, setExpandedArtist] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (currentHighlightId) {
      const id = parseInt(currentHighlightId, 10);
      if (!Number.isNaN(id)) setExpandedArtist(id);
    }
  }, [currentHighlightId]);

  return (
    <FlatList
      ref={flatListRef}
      data={artists}
      keyExtractor={(item) => item.id.toString()}
      bounces={false}
      overScrollMode="never"
      onScrollToIndexFailed={(info) => {
        const wait = new Promise(resolve => setTimeout(resolve, 500));
        wait.then(() => {
          flatListRef.current?.scrollToIndex({
            index: info.index,
            animated: true,
            viewPosition: 0.2,
          });
        });
      }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refetch}
          tintColor={theme.background.secondary}
          title="Actualisation..."
          titleColor={theme.background.secondary}
        />
      }
      renderItem={({ item }) => {
        const isHighlighted = isItemHighlighted(item.id);
        const isOpen = expandedArtist === item.id;
        const datesText = `${extractDayName(item.date_start).substring(0, 3)} ${extractTime(item.date_start)} - ${extractTime(item.date_end)}`;
        return (
          <Animated.View style={isHighlighted ? animatedStyle : undefined}>
            <View style={[
              styles.card,
              isHighlighted && styles.highlightedCard
            ]}>
              <View style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }} >
                <SubscribeButton type="artist" id={item.id} compact />
              </View>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  clearHighlight();
                  setExpandedArtist(prev => (prev === item.id ? null : item.id));
                }}
              >
                {(() => {
                  const fullImgHeight = width * 0.65;
                  const collapsedImgHeight = width * 0.22;
                  const offset = imageMapper[item.image]?.offsetY ?? 0.5;
                  const desired = (collapsedImgHeight / 2) - (offset * fullImgHeight);
                  const minTranslate = -(fullImgHeight - collapsedImgHeight);
                  const maxTranslate = 0;
                  const clampedTranslate = Math.max(minTranslate, Math.min(maxTranslate, desired));
                  const translateY = isOpen ? 0 : clampedTranslate;
                  return (
                    <View style={[styles.cardTop, { height: isOpen ? fullImgHeight : collapsedImgHeight }]}>
                      <Image
                        alt=""
                        resizeMode="cover"
                        source={imageMapper[item.image]?.src}
                        style={[styles.cardImgAbsolute, { height: fullImgHeight, top: 0, left: 0, transform: [{ translateY }] }]}
                      />
                      <View style={styles.cardTopPills}>
                        <View style={[styles.cardTopPill, { paddingLeft: 6 }]}>
                          {
                            isOpen ? (
                              <Text style={styles.cardTopPillText}>{item.style}</Text>
                            )
                            :(
                              <>
                              <ThemedText style={[styles.cardTitle, {color:'white'}]}>{item.name} </ThemedText>
                              <Text style={[styles.cardDescription, { color: 'white', textAlign: 'right' }]}>
                                  {datesText}
                              </Text>
                              </>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })()}
              </TouchableOpacity>

              <Collapsible collapsed={!isOpen} duration={300} align="top">
                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
                    <Text style={[styles.cardDescription, { textAlign: 'right' }]}>
                      {datesText}
                    </Text>
                  </View>
                  <Text style={styles.cardDescription}>{item.bio}</Text>
                </View>
              </Collapsible>
            </View>
          </Animated.View>
        );
      }}
      contentContainerStyle={styles.scrollContent}
    />
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: layout.tabBar.contentPadding,
  },
  card: {
    padding: 12,
    borderRadius: 24,
    marginBottom: 24,
    backgroundColor: theme.background.secondary,
    width: '90%',
    maxWidth: 500,
    alignSelf: 'center'
  },
  highlightedCard: {
    borderWidth: 3,
    borderColor: theme.interactive.primary,
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: 12,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  cardTop: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardImgAbsolute: {
    position: 'absolute',
    width: '100%',
    borderRadius: 24,
  },
  cardTopPills: {
    position: 'absolute',
    bottom: 5,
    left: 10,
    backgroundColor: theme.background.overlay,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardTopPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTopPillText: {
    color: theme.text.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d1d1d',
    textAlign: 'justify',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#3c3c3c',
    textAlign: 'justify',
    flexShrink: 1,
  },
});
